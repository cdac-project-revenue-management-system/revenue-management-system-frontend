import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/common/DataTable";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Mail,
  Trash2,
  Ban,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientDialog } from "@/components/dialogs/ClientDialog";
import { useToast } from "@/hooks/use-toast";
import { clientsService } from "@/services";

import { format } from "date-fns";

const statusColors = {
  active: "success",
  inactive: "warning",
  churned: "destructive",
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

const Clients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState([]); // Initialize with empty array
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState();

  // ==========================================
  // Fetch clients from API on mount
  // ==========================================
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        // Create params object
        const params = {};

        // Get current user to filter by company if applicable
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

        const data = await clientsService.getAll(params);
        // Map backend data to frontend structure if needed, or use directly if DTOs match
        // Ensure status acts as lowercase for badges
        const processedData = data.map(client => ({
          ...client,
          id: client.formattedId || client.id, // Use formattedId for display
          originalId: client.id, // Keep original integer ID for API calls
          name: client.fullName,
          company: client.companyName || "Private Client",
          email: client.email,
          status: client.statusString || (client.status ? client.status.toLowerCase() : "active"),
          joinedAt: client.joinedAt || client.createdAt,
          totalSpent: client.totalSpent || 0,
          subscriptions: client.subscriptions || 0
        }));
        setClients(processedData);

        // REMOVE: Mock data loading

      } catch (error) {
        toast({ title: "Error", description: "Failed to load clients", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      (client.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (client.company?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (client.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleEdit = (client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleSuspend = async (id) => {
    try {
      // Find the client to get the original Integer ID
      const clientToSuspend = clients.find(c => c.id === id || c.originalId === id);
      if (!clientToSuspend) return;

      await clientsService.suspend(clientToSuspend.originalId);

      setClients(prev => prev.map(c => c.id === id ? { ...c, status: "inactive" } : c));
      toast({ title: "Client suspended successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to suspend client", variant: "destructive" });
    }
  };



  const handleDelete = async (id) => {
    try {
      const clientToDelete = clients.find(c => c.id === id || c.originalId === id);
      if (!clientToDelete) return;

      await clientsService.delete(clientToDelete.originalId);

      setClients(prev => prev.filter(c => c.id !== id));
      toast({ title: "Client deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete client", variant: "destructive" });
    }
  };

  const handleExport = () => {
    const headers = ["ID", "Name", "Email", "Company", "Status", "Subscriptions", "Total Spent", "Last Activity", "Joined At"];
    const csvContent = [
      headers.join(","),
      ...filteredClients.map(client =>
        [client.id, client.name, client.email, client.company, client.status, client.subscriptions, client.totalSpent, client.lastActivity, client.joinedAt].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "clients.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Clients exported successfully" });
    }
  };

  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) setEditingClient(undefined);
  };

  const handleClientSuccess = (client) => {
    if (editingClient) {
      setClients(prev => prev.map(c => c.id === client.id ? client : c));
    } else {
      setClients(prev => [...prev, client]);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Client",
      render: (client) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-primary/20">
            <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
              {(client.name || "U").split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{client.name}</p>
            <p className="text-xs text-muted-foreground">{client.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      render: (client) => <span className="text-muted-foreground">{client.company}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (client) => <Badge variant={statusColors[client.status]}>{client.status}</Badge>,
    },
    {
      key: "subscriptions",
      header: "Subscriptions",
      render: (client) => <span className="font-medium">{client.subscriptions}</span>,
    },
    {
      key: "totalSpent",
      header: "Total Spent",
      render: (client) => <span className="font-semibold text-success">${(client.totalSpent || 0).toLocaleString()}</span>,
    },
    {
      key: "lastActivity",
      header: "Last Activity",
      render: (client) => <span className="text-muted-foreground">{safeDate(client.lastActivity)}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (client) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/clients/${client.originalId}`)}><Eye className="h-4 w-4 mr-2" />View Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(client)}><Edit className="h-4 w-4 mr-2" />Edit Client</DropdownMenuItem>
            {client.status === "active" && <DropdownMenuItem className="text-warning" onClick={() => handleSuspend(client.id)}><Ban className="h-4 w-4 mr-2" />Suspend</DropdownMenuItem>}
            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(client.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your customer accounts and profiles</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 flex-1 md:flex-none" onClick={handleExport}><Download className="h-4 w-4" />Export</Button>
          <Button variant="gradient" className="gap-2 flex-1 md:flex-none" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />Add Client</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-gradient-card border border-border">
          <p className="text-2xl md:text-3xl font-bold">{clients.length}</p>
          <p className="text-sm text-muted-foreground">Total Clients</p>
        </div>
        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
          <p className="text-2xl md:text-3xl font-bold text-success">{clients.filter((c) => c.status === "active").length}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-2xl md:text-3xl font-bold text-warning">{clients.filter((c) => c.status === "inactive").length}</p>
          <p className="text-sm text-muted-foreground">Inactive</p>
        </div>
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-2xl md:text-3xl font-bold text-destructive">{clients.filter((c) => c.status === "churned").length}</p>
          <p className="text-sm text-muted-foreground">Churned</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-full" />
        </div>
      </div>

      <DataTable columns={columns} data={filteredClients} />

      <ClientDialog open={dialogOpen} onOpenChange={handleDialogClose} client={editingClient} onSuccess={handleClientSuccess} />
    </div>
  );
};
export default Clients;
