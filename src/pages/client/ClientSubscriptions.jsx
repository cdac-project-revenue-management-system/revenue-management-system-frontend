import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  ArrowUpRight,
  Pause,
  XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ExplorePlansDialog } from "@/components/dialogs/ExplorePlansDialog";
import { SubscriptionDetailsDialog } from "@/components/dialogs/SubscriptionDetailsDialog";
import { ChangePlanDialog } from "@/components/dialogs/ChangePlanDialog";
import { UpdateBillingDialog } from "@/components/dialogs/UpdateBillingDialog";
import { subscriptionsService } from "@/services";

// ... mockSubscriptions etc can serve as fallback or be removed ...

const statusConfig = {
  active: { label: "Active", variant: "success", icon: CheckCircle },
  paused: { label: "Paused", variant: "warning", icon: Pause },
  cancelled: { label: "Cancelled", variant: "secondary", icon: XCircle },
  past_due: { label: "Past Due", variant: "destructive", icon: AlertTriangle },
  inactive: { label: "Inactive", variant: "secondary", icon: XCircle },
  trial: { label: "Trial", variant: "info", icon: CheckCircle },
};

const ClientSubscriptions = () => {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [explorePlansOpen, setExplorePlansOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [updateBillingOpen, setUpdateBillingOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // ==========================================
  // Fetch subscriptions from API on mount
  // ==========================================
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        // Get current user ID
        const userStr = localStorage.getItem("user");
        let clientId = null;
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            clientId = user.id;
          } catch (e) {
            console.error("Error parsing user from localstorage", e);
          }
        }

        if (!clientId) {
          // Handle case where user is not logged in / invalid session
          setSubscriptions([]);
          return;
        }

        const data = await subscriptionsService.getAll();

        // Filter for current client
        const clientSubscriptions = data.filter(sub => sub.client?.id === clientId || sub.clientId === clientId);

        // Helper to safely format dates
        const formatDate = (dateString) => {
          if (!dateString) return "N/A";
          try {
            // Handle array format [2026, 1, 27] if Jackson sends it
            if (Array.isArray(dateString)) {
              // Note: Month in JS Date is 0-indexed, but backend is likely 1-indexed (Java LocalDate)
              return new Date(dateString[0], dateString[1] - 1, dateString[2]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            }
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          } catch (e) {
            return "N/A";
          }
        };

        // Map backend data to frontend model
        const mappedSubs = clientSubscriptions.map(sub => ({
          id: sub.formattedId || sub.id,
          originalId: sub.id,
          name: sub.plan, // Plan Name
          product: sub.product, // Product Name
          status: sub.statusString || sub.status.toLowerCase(),
          amount: sub.amount,
          billingCycle: sub.interval || "monthly",
          nextBilling: formatDate(sub.nextBilling),
          startDate: formatDate(sub.startDate),
          features: ["Standard Plan Features"], // Backend DTO might not return features list yet
        }));

        setSubscriptions(mappedSubs);
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to load subscriptions", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  const activeSubscriptions = subscriptions.filter(s => s.status === "active");
  const totalMonthly = activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  const handleViewDetails = (subscription) => {
    setSelectedSub(subscription);
    setDetailsDialogOpen(true);
  };

  const handleChangePlan = (subscription) => {
    setSelectedSub(subscription);
    setChangePlanOpen(true);
  };

  const handleUpdateBilling = (subscription) => {
    setSelectedSub(subscription);
    setUpdateBillingOpen(true);
  };

  const handleCancelSubscription = (subscription) => {
    setSelectedSub(subscription);
    setCancelDialogOpen(true);
  };

  const confirmCancelSubscription = async () => {
    if (!selectedSub) return;

    setCancelling(true);

    try {
      await subscriptionsService.cancel(selectedSub.originalId || selectedSub.id);

      setSubscriptions(prev =>
        prev.map(sub =>
          sub.id === selectedSub.id
            ? { ...sub, status: "cancelled" }
            : sub
        )
      );

      toast({
        title: "Subscription cancelled",
        description: `${selectedSub.name} has been cancelled. You'll have access until the end of your billing period.`,
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel subscription", variant: "destructive" });
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
      setSelectedSub(null);
    }
  };

  const handleNewSubscription = (newSubResponse) => {
    // Re-fetch or manually add. Since we mapped data, it's safer to re-fetch or map the response.
    // For simplicity and to show immediate feedback, we will assume generic values or reload window/component
    window.location.reload();
  };

  const handlePlanChanged = (subscription, newPlan) => {
    // UNCOMMENT: API call
    // await subscriptionsService.changePlan(subscription.id, newPlan.id);

    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === subscription.id
          ? { ...sub, name: newPlan.name, amount: newPlan.price }
          : sub
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Subscriptions</h1>
            <p className="text-muted-foreground mt-1">Manage and view all your active subscriptions</p>
          </div>
        </div>
        <Card className="p-8 text-center border-dashed border-2">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No Active Subscriptions</h3>
            <p className="text-muted-foreground max-w-sm">You don't have any active subscriptions yet. Subscribe to a plan to unlock features.</p>
            <Button variant="gradient" size="lg" onClick={() => setExplorePlansOpen(true)}>
              Explore Plans
            </Button>
          </div>
        </Card>
        <ExplorePlansDialog open={explorePlansOpen} onOpenChange={setExplorePlansOpen} onSubscribe={handleNewSubscription} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Subscriptions</h1>
          <p className="text-muted-foreground mt-1">Manage and view all your active subscriptions</p>
        </div>
        <Button variant="gradient" onClick={() => setExplorePlansOpen(true)}>
          <ArrowUpRight className="mr-2 h-4 w-4" />
          Explore Plans
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeSubscriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalMonthly}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeSubscriptions[0]?.nextBilling?.split(",")[0] || "N/A"}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {subscriptions.map((subscription) => {
          const config = statusConfig[subscription.status] || statusConfig.active;
          const StatusIcon = config.icon;
          return (
            <Card key={subscription.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{subscription.name}</CardTitle>
                      <Badge variant={config.variant}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">{subscription.product}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(subscription)}>View Details</DropdownMenuItem>
                    {subscription.status === "active" && (
                      <>
                        <DropdownMenuItem onClick={() => handleChangePlan(subscription)}>Change Plan</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateBilling(subscription)}>Update Billing</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleCancelSubscription(subscription)}>Cancel Subscription</DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Billing Amount</span>
                      <span className="font-medium">₹{subscription.amount}/{subscription.billingCycle === "monthly" ? "mo" : "yr"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Next Billing Date</span>
                      <span className="font-medium flex items-center gap-2"><Calendar className="h-4 w-4" />{subscription.nextBilling}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Started</span>
                      <span className="font-medium">{subscription.startDate}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Included Features</p>
                    <ul className="space-y-1">
                      {subscription.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ExplorePlansDialog open={explorePlansOpen} onOpenChange={setExplorePlansOpen} onSubscribe={handleNewSubscription} />
      <SubscriptionDetailsDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} subscription={selectedSub} />
      <ChangePlanDialog open={changePlanOpen} onOpenChange={setChangePlanOpen} subscription={selectedSub} onChangePlan={handlePlanChanged} />
      <UpdateBillingDialog open={updateBillingOpen} onOpenChange={setUpdateBillingOpen} subscription={selectedSub} />

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>Are you sure you want to cancel {selectedSub?.name}? You'll lose access to all features at the end of your current billing period.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>Keep Subscription</Button>
            <Button variant="destructive" onClick={confirmCancelSubscription} disabled={cancelling}>{cancelling ? "Cancelling..." : "Yes, Cancel"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientSubscriptions;
