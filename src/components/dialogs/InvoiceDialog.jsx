import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
// TODO: Import API service when backend is ready
import { invoicesService } from "@/services";

export const InvoiceDialog = ({ open, onOpenChange, invoice, clients, onSuccess }) => {
  const { toast } = useToast();
  const isEdit = !!invoice;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    client: "",
    clientEmail: "",
    amount: 0,
    status: "draft",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    items: 1,
  });

  // Helper to convert backend date (array or string) to YYYY-MM-DD for input
  const toISODate = (dateInput) => {
    if (!dateInput) return "";
    try {
      if (Array.isArray(dateInput)) {
        // [2024, 1, 30] -> "2024-01-30"
        const [year, month, day] = dateInput;
        const m = String(month).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
      }
      return dateInput.split('T')[0];
    } catch (e) {
      console.error("Date parse error", e);
      return "";
    }
  };

  // Reset form when dialog opens/closes or invoice changes
  useEffect(() => {
    if (invoice) {
      setFormData({
        client: invoice.clientId ? invoice.clientId.toString() : "",
        clientEmail: invoice.clientEmail || "",
        amount: invoice.amount || 0,
        status: invoice.status || "draft",
        issueDate: toISODate(invoice.issueDate),
        dueDate: toISODate(invoice.dueDate),
        items: invoice.items || 1,
      });
    } else {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 14);
      setFormData({
        client: "",
        clientEmail: "",
        amount: 0,
        status: "draft",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: defaultDueDate.toISOString().split("T")[0],
        items: 1,
      });
    }
  }, [invoice, open]);

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find(c => c.id.toString() === clientId.toString());
    setFormData({
      ...formData,
      client: clientId.toString(),
      clientEmail: selectedClient?.email || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const selectedClient = clients.find(c => c.id.toString() === formData.client.toString());
    if (!selectedClient) {
      toast({ title: "Error", description: "Please select a valid client", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    let companyId = null;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "COMPANY") companyId = user.id;
      } catch (e) { }
    }

    const payload = {
      clientId: selectedClient.id,
      companyId: companyId,
      amount: formData.amount,
      status: formData.status.toUpperCase(),
      issueDate: formData.issueDate.includes('T') ? formData.issueDate : `${formData.issueDate}T00:00:00`,
      dueDate: formData.dueDate.includes('T') ? formData.dueDate : (formData.dueDate ? `${formData.dueDate}T00:00:00` : null),
      items: formData.items
    };

    try {
      if (isEdit && invoice) {
        // API Call
        const updatedInvoice = await invoicesService.update(invoice.originalId, payload);
        onSuccess?.(updatedInvoice);
        toast({ title: "Invoice updated successfully" });
      } else {
        // API Call
        const newInvoice = await invoicesService.create(payload);
        onSuccess?.(newInvoice);
        toast({ title: "Invoice created successfully" });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Invoice Error:", error);
      toast({ title: "Error", description: error?.response?.data?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the invoice details below." : "Create a new invoice for a client."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Client</Label>
              <Select value={formData.client} onValueChange={handleClientChange} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client, index) => (
                    <SelectItem key={client.id ? `${client.id}-${index}` : index} value={client.id ? client.id.toString() : `temp-${index}`}>
                      {(client.company || "Unknown Company")} ({(client.name || "Unknown")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter amount"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="items">Number of Items</Label>
                <Input
                  id="items"
                  type="number"
                  min="1"
                  value={formData.items}
                  onChange={(e) => setFormData({ ...formData, items: parseInt(e.target.value) || 1 })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isLoading}>
              {isLoading ? "Saving..." : `${isEdit ? "Update" : "Create"} Invoice`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
