import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/common/DataTable";
import {
  Plus,
  Search,
  Download,
  MoreVertical,
  Eye,
  Send,
  Edit,
  Trash2,
  FileText,
  Printer,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoiceDialog } from "@/components/dialogs/InvoiceDialog";
import { useToast } from "@/hooks/use-toast";
import { invoicesService, clientsService } from "@/services";

import { format } from "date-fns";
import { InvoiceDetailsDialog } from "@/components/dialogs/InvoiceDetailsDialog";

const statusColors = {
  paid: "success",
  pending: "warning",
  overdue: "destructive",
  draft: "secondary",
};

const safeDate = (dateInput) => {
  if (!dateInput) return "N/A";

  let date;
  try {
    if (Array.isArray(dateInput)) {
      const [year, month, day, hour, minute, second] = dateInput;
      date = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) return String(dateInput);
    return format(date, "MMM dd, yyyy");
  } catch (e) {
    return String(dateInput || "Invalid Date");
  }
};

// ==========================================
// Mock data - Remove when backend is connected
// ==========================================
const Invoices = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState();
  const [editingInvoice, setEditingInvoice] = useState();

  // ==========================================
  // Fetch data from API on mount
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user.role && user.role.toUpperCase() === "COMPANY") {
              params.companyId = user.id || -1;
            }
          } catch (e) {
            console.error("Error parsing user", e);
          }
        }

        const [invoicesData, clientsData] = await Promise.all([
          invoicesService.getAll(params),
          clientsService.getAll(params)
        ]);

        const processedInvoices = invoicesData.map(inv => ({
          ...inv,
          id: inv.formattedId || inv.id,
          originalId: inv.id,
          status: inv.statusString ? inv.statusString.toLowerCase() : (inv.status ? inv.status.toLowerCase() : "draft")
        }));

        const processedClients = clientsData.map(c => ({
          ...c,
          name: c.fullName,
          company: c.companyName || "Private Client"
        }));

        setInvoices(processedInvoices);
        setClients(processedClients);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = (inv.client?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || (inv.id?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = filteredInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = filteredInvoices.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = filteredInvoices.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0);

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setDialogOpen(true);
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailsOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const invoiceToDelete = invoices.find(inv => inv.id === id || inv.originalId === id);
      if (!invoiceToDelete) return;

      await invoicesService.delete(invoiceToDelete.originalId);

      setInvoices(prev => prev.filter(inv => inv.id !== id));
      toast({ title: "Invoice deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete invoice", variant: "destructive" });
    }
  };

  const handlePrint = (invoice) => {
    toast({ title: "Printing invoice..." });
    window.print();
  };

  const handleDownload = async (invoice) => {
    try {
      const blob = await invoicesService.download(invoice.originalId || invoice.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${invoice.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast({ title: "Downloaded PDF", description: `Invoice ${invoice.id}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to download PDF", variant: "destructive" });
    }
  };

  const handleSend = (invoice) => {
    toast({ title: "Invoice sent", description: `Sent to ${invoice.clientEmail}` });
  };

  const handleExport = () => {
    const headers = ["ID", "Client", "Client Email", "Amount", "Status", "Issue Date", "Due Date", "Items"];
    const csvContent = [
      headers.join(","),
      ...filteredInvoices.map(inv =>
        [inv.id, inv.client, inv.clientEmail, inv.amount, inv.status, inv.issueDate, inv.dueDate, inv.items].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "invoices.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Invoices exported successfully" });
    }
  };

  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) setEditingInvoice(undefined);
  };

  const handleInvoiceSuccess = (invoice) => {
    const processedInvoice = {
      ...invoice,
      id: invoice.formattedId || invoice.id,
      originalId: invoice.id,
      status: invoice.statusString || invoice.status.toLowerCase()
    };

    setInvoices(prev => {
      const exists = prev.some(inv => inv.originalId === processedInvoice.originalId);
      if (exists) {
        return prev.map(inv => inv.originalId === processedInvoice.originalId ? processedInvoice : inv);
      }
      return [...prev, processedInvoice];
    });
  };

  const columns = [
    {
      key: "id",
      header: "Invoice",
      render: (inv) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary"><FileText className="h-4 w-4 text-primary" /></div>
          <div>
            <p className="font-mono font-medium">{inv.id}</p>
            <p className="text-xs text-muted-foreground">{inv.items} items</p>
          </div>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (inv) => (
        <div>
          <p className="font-medium">{inv.client}</p>
          <p className="text-xs text-muted-foreground">{inv.clientEmail}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (inv) => <span className="font-semibold">₹{inv.amount.toLocaleString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (inv) => <Badge variant={statusColors[inv.status]}>{inv.status}</Badge>,
    },
    {
      key: "issueDate",
      header: "Issue Date",
      render: (inv) => <span className="text-muted-foreground">{safeDate(inv.issueDate)}</span>,
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (inv) => <span className={inv.status === "overdue" ? "text-destructive font-medium" : "text-muted-foreground"}>{safeDate(inv.dueDate)}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (inv) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(inv)}><Eye className="h-4 w-4 mr-2" />View Invoice</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(inv)}><Edit className="h-4 w-4 mr-2" />Edit Invoice</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload(inv)}><Download className="h-4 w-4 mr-2" />Download PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePrint(inv)}><Printer className="h-4 w-4 mr-2" />Print</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSend(inv)}><Send className="h-4 w-4 mr-2" />Send to Client</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(inv.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-12",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage billing and payment records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 flex-1 md:flex-none" onClick={handleExport}><Download className="h-4 w-4" />Export All</Button>
          <Button variant="gradient" className="gap-2 flex-1 md:flex-none" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />Create Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-gradient-card border border-border">
          <p className="text-xl md:text-2xl lg:text-3xl font-bold">₹{totalAmount.toLocaleString()}</p>
          <p className="text-xs md:text-sm text-muted-foreground">Total Amount</p>
        </div>
        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-success">₹{paidAmount.toLocaleString()}</p>
          <p className="text-xs md:text-sm text-muted-foreground">Paid</p>
        </div>
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-warning">₹{pendingAmount.toLocaleString()}</p>
          <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-destructive">₹{overdueAmount.toLocaleString()}</p>
          <p className="text-xs md:text-sm text-muted-foreground">Overdue</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-full" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filteredInvoices} />

      <InvoiceDialog open={dialogOpen} onOpenChange={handleDialogClose} invoice={editingInvoice} clients={clients} onSuccess={handleInvoiceSuccess} />

      <InvoiceDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} invoice={selectedInvoice} />
    </div>
  );
};
export default Invoices;
