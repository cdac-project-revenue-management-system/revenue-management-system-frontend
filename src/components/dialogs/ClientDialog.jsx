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
import { clientsService } from "@/services";

// TODO: Import API service when backend is ready
// import { clientsApi } from "@/services/api";

export const ClientDialog = ({ open, onOpenChange, client, onSuccess }) => {
  const { toast } = useToast();
  const isEdit = !!client;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    status: "active",
  });

  // Reset form when dialog opens/closes or client changes
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        company: client.company,
        status: client.status,
      });
    } else {
      setFormData({ name: "", email: "", company: "", status: "active" });
    }
  }, [client, open]);

  /* Removed misplaced import */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.name,
        email: formData.email,
        companyName: formData.company,
        status: formData.status.toUpperCase(),
      };

      if (isEdit && client) {
        const response = await clientsService.update(client.originalId || client.id, payload);

        // Map response back to frontend structure to update local state immediately
        const processedClient = {
          ...response,
          id: response.formattedId || response.id,
          originalId: response.id,
          name: response.fullName,
          company: response.companyName,
          status: response.statusString || response.status.toLowerCase(),
          subscriptions: client.subscriptions, // Preserve UI fields not in response
          totalSpent: client.totalSpent,
          lastActivity: client.lastActivity
        };

        onSuccess?.(processedClient);
        toast({ title: "Client updated successfully" });
      } else {
        // Initial defaults for new client creator
        const createPayload = {
          ...payload,
          password: "Password@123", // Default password for created users
          role: "CLIENT"
        };
        const response = await clientsService.create(createPayload);

        const processedClient = {
          ...response,
          id: response.formattedId || response.id,
          originalId: response.id,
          name: response.fullName,
          company: response.companyName,
          status: "active",
          subscriptions: 0,
          totalSpent: 0,
          lastActivity: "Just now",
          joinedAt: new Date().toISOString()
        };

        onSuccess?.(processedClient);
        toast({ title: "Client created successfully" });
      }

      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to save client details", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the client details below." : "Add a new client to your system."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Enter company name"
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isLoading}>
              {isLoading ? "Saving..." : `${isEdit ? "Update" : "Add"} Client`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
