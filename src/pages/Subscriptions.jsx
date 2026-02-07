import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/common/DataTable";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  XCircle,
  RefreshCw,
  Trash2,
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
import { format } from "date-fns";
import { SubscriptionDetailsDialog } from "@/components/dialogs/SubscriptionDetailsDialog";
import { SubscriptionDialog } from "@/components/dialogs/SubscriptionDialog";
import { useToast } from "@/hooks/use-toast";
import { subscriptionsService, clientsService, plansService, productsService } from "@/services";

const statusColors = {
  active: "success",
  trial: "info",
  paused: "warning",
  cancelled: "secondary",
  past_due: "destructive",
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
// Subscriptions Page
// ==========================================
const Subscriptions = () => {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState();
  const [editingSubscription, setEditingSubscription] = useState();

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

        const [subscriptionsData, clientsData, plansData, productsData] = await Promise.all([
          subscriptionsService.getAll(params),
          clientsService.getAll(params),
          plansService.getAll(params),
          productsService.getAll(params)
        ]);

        const processedSubs = subscriptionsData.map(sub => ({
          ...sub,
          id: sub.formattedId || sub.id,
          originalId: sub.id,
          status: sub.statusString || sub.status.toLowerCase(),
          interval: sub.interval || "monthly"
        }));

        const processedClients = clientsData.map(c => ({
          ...c,
          name: c.fullName,
          company: c.companyName || "Private Client"
        }));

        setSubscriptions(processedSubs);
        setClients(processedClients);
        setPlans(plansData);
        setProducts(productsData);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = (sub.client?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || (sub.id?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setDialogOpen(true);
  };

  const handleViewDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setDetailsOpen(true);
  };

  const handleRenew = async (id) => {
    try {
      const subToRenew = subscriptions.find(s => s.id === id || s.originalId === id);
      if (!subToRenew) return;

      const updatedSub = await subscriptionsService.renew(subToRenew.originalId);
      handleSubscriptionSuccess(updatedSub);

      toast({ title: "Subscription renewed successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to renew subscription", variant: "destructive" });
    }
  };

  const handleCancel = async (id) => {
    try {
      const subToCancel = subscriptions.find(s => s.id === id || s.originalId === id);
      if (!subToCancel) return;

      const updatedSub = await subscriptionsService.cancel(subToCancel.originalId);
      handleSubscriptionSuccess(updatedSub);

      toast({ title: "Subscription cancelled successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel subscription", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    try {
      const subToDelete = subscriptions.find(s => s.id === id || s.originalId === id);
      if (!subToDelete) return;

      await subscriptionsService.delete(subToDelete.originalId);

      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      toast({ title: "Subscription deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete subscription", variant: "destructive" });
    }
  };

  const handleExport = () => {
    const headers = ["ID", "Client", "Client Email", "Plan", "Product", "Status", "Amount", "Interval", "Start Date", "Next Billing"];
    const csvContent = [
      headers.join(","),
      ...filteredSubscriptions.map(sub =>
        [sub.id, sub.client, sub.clientEmail, sub.plan, sub.product, sub.status, sub.amount, sub.interval, sub.startDate, sub.nextBilling].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "subscriptions.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Subscriptions exported successfully" });
    }
  };

  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) setEditingSubscription(undefined);
  };

  const handleSubscriptionSuccess = (subscription) => {
    const processedSub = {
      ...subscription,
      id: subscription.formattedId || subscription.id,
      originalId: subscription.id,
      status: subscription.statusString || subscription.status.toLowerCase(),
      interval: subscription.interval || "monthly"
    };

    setSubscriptions(prev => {
      const exists = prev.some(sub => sub.originalId === processedSub.originalId);
      if (exists) {
        return prev.map(sub => sub.originalId === processedSub.originalId ? processedSub : sub);
      }
      return [...prev, processedSub];
    });
  };

  const columns = [
    { key: "id", header: "ID", render: (sub) => <span className="font-mono text-sm text-muted-foreground">{sub.id}</span> },
    {
      key: "client",
      header: "Client",
      render: (sub) => (
        <div>
          <p className="font-medium">{sub.client}</p>
          <p className="text-xs text-muted-foreground">{sub.clientEmail}</p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (sub) => (
        <div>
          <p className="font-medium">{sub.plan}</p>
          <p className="text-xs text-muted-foreground">{sub.product}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (sub) => <Badge variant={statusColors[sub.status]}>{sub.status.replace("_", " ")}</Badge> },
    { key: "amount", header: "Amount", render: (sub) => <span className="font-semibold">₹{sub.amount}/{sub.interval === "monthly" ? "mo" : "yr"}</span> },
    { key: "nextBilling", header: "Next Billing", render: (sub) => <span className="text-muted-foreground">{safeDate(sub.nextBilling)}</span> },
    {
      key: "actions",
      header: "",
      render: (sub) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(sub)}><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(sub)}><Edit className="h-4 w-4 mr-2" />Edit Subscription</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRenew(sub.id)}><RefreshCw className="h-4 w-4 mr-2" />Renew Now</DropdownMenuItem>
            {sub.status === "active" && <DropdownMenuItem className="text-destructive" onClick={() => handleCancel(sub.id)}><XCircle className="h-4 w-4 mr-2" />Cancel</DropdownMenuItem>}
            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(sub.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground mt-1">Manage customer subscriptions and billing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 flex-1 md:flex-none" onClick={handleExport}><Download className="h-4 w-4" />Export</Button>
          <Button variant="gradient" className="gap-2 flex-1 md:flex-none" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />New Subscription</Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search subscriptions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-full" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-lg bg-secondary/50 text-center"><p className="text-xl md:text-2xl font-bold">{subscriptions.filter((s) => s.status === "active").length}</p><p className="text-xs md:text-sm text-muted-foreground">Active</p></div>
        <div className="p-4 rounded-lg bg-info/10 text-center"><p className="text-xl md:text-2xl font-bold text-info">{subscriptions.filter((s) => s.status === "trial").length}</p><p className="text-xs md:text-sm text-muted-foreground">Trial</p></div>
        <div className="p-4 rounded-lg bg-warning/10 text-center"><p className="text-xl md:text-2xl font-bold text-warning">{subscriptions.filter((s) => s.status === "paused").length}</p><p className="text-xs md:text-sm text-muted-foreground">Paused</p></div>
        <div className="p-4 rounded-lg bg-destructive/10 text-center"><p className="text-xl md:text-2xl font-bold text-destructive">{subscriptions.filter((s) => s.status === "past_due").length}</p><p className="text-xs md:text-sm text-muted-foreground">Past Due</p></div>
        <div className="p-4 rounded-lg bg-muted/50 text-center col-span-2 sm:col-span-1"><p className="text-xl md:text-2xl font-bold text-muted-foreground">{subscriptions.filter((s) => s.status === "cancelled").length}</p><p className="text-xs md:text-sm text-muted-foreground">Cancelled</p></div>
      </div>

      <DataTable columns={columns} data={filteredSubscriptions} />

      <SubscriptionDialog open={dialogOpen} onOpenChange={handleDialogClose} subscription={editingSubscription} clients={clients} plans={plans} products={products} onSuccess={handleSubscriptionSuccess} />

      <SubscriptionDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        subscription={selectedSubscription}
      />
    </div>
  );
};
export default Subscriptions;
