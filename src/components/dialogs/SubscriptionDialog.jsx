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
import { subscriptionsService } from "@/services";

export const SubscriptionDialog = ({
  open,
  onOpenChange,
  subscription,
  clients,
  plans,
  products,
  onSuccess
}) => {
  const { toast } = useToast();
  const isEdit = !!subscription;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    client: "",
    clientEmail: "",
    plan: "",
    product: "",
    status: "active",
    amount: 0,
    interval: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    nextBilling: "",
  });

  // Reset form when dialog opens/closes or subscription changes
  useEffect(() => {
    if (subscription) {
      setFormData({
        client: subscription.client,
        clientEmail: subscription.clientEmail,
        plan: subscription.plan,
        product: subscription.product,
        status: subscription.status,
        amount: subscription.amount,
        interval: subscription.interval,
        startDate: subscription.startDate,
        nextBilling: subscription.nextBilling,
      });
    } else {
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      setFormData({
        client: "",
        clientEmail: "",
        plan: "",
        product: "",
        status: "active",
        amount: 0,
        interval: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        nextBilling: nextBillingDate.toISOString().split("T")[0],
      });
    }
  }, [subscription, open]);

  const handleClientChange = (clientId) => {
    // clientId comes as a string from the Select value, convert if needed or compare safely
    const selectedClient = clients.find(c => c.id.toString() === clientId.toString());
    setFormData({
      ...formData,
      client: clientId.toString(), // Store ID as the selected value
      clientEmail: selectedClient?.email || "",
    });
  };

  const handlePlanChange = (planName) => {
    const selectedPlan = plans.find(p => p.name === planName);
    setFormData({
      ...formData,
      plan: planName,
      product: selectedPlan?.product || formData.product,
      amount: selectedPlan?.price || formData.amount,
      interval: selectedPlan?.interval?.toLowerCase() || formData.interval
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

    const selectedPlan = plans.find(p => p.name === formData.plan);
    if (!selectedPlan) {
      toast({ title: "Error", description: "Please select a valid plan", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Calculate next billing date if not set: Start Date + 1 Month/Year based on plan
    let nextBillingDate = formData.nextBilling;
    if (!nextBillingDate) {
      const start = new Date(formData.startDate);
      if (selectedPlan.interval === "yearly") {
        start.setFullYear(start.getFullYear() + 1);
      } else {
        start.setMonth(start.getMonth() + 1);
      }
      nextBillingDate = start.toISOString().split('T')[0];
    }

    const subData = {
      clientId: selectedClient.originalId || selectedClient.id,
      planId: selectedPlan.originalId || selectedPlan.id,
      status: formData.status.toUpperCase(), // ACTIVE, PAUSED, etc.
      amount: formData.amount,
      startDate: formData.startDate.includes('T') ? formData.startDate : `${formData.startDate}T00:00:00`,
      nextBilling: nextBillingDate.includes('T') ? nextBillingDate : `${nextBillingDate}T00:00:00`
    };

    try {
      if (isEdit && subscription) {
        // API Call
        const updatedSubscription = await subscriptionsService.update(subscription.originalId, subData);
        onSuccess?.(updatedSubscription);
        toast({ title: "Subscription updated successfully" });
      } else {
        // API Call
        const newSubscription = await subscriptionsService.create(subData);
        onSuccess?.(newSubscription);
        toast({ title: "Subscription created successfully" });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Subscription Error:", error);
      toast({ title: "Error", description: error?.response?.data?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter active clients and products
  // Use all clients and products for selection
  const activeClients = clients;
  const activeProducts = products;
  const filteredPlans = plans.filter(p => !formData.product || p.product === formData.product);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Subscription" : "New Subscription"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the subscription details below." : "Create a new subscription for a client."}
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
                  {activeClients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {(client.company || "Unknown Company")} ({(client.name || "Unknown")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product">Product</Label>
              <Select value={formData.product} onValueChange={(value) => setFormData({ ...formData, product: value })} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {activeProducts.map((product) => (
                    <SelectItem key={product.id} value={product.name}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plan">Plan</Label>
              <Select value={formData.plan} onValueChange={handlePlanChange} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {filteredPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.name}>
                      {plan.name} - ₹{plan.price}/{plan.interval}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interval">Interval</Label>
                <Select value={formData.interval} onValueChange={(value) => setFormData({ ...formData, interval: value })} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
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
              {isLoading ? "Saving..." : `${isEdit ? "Update" : "Create"} Subscription`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
