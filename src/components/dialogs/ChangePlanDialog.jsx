import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const availablePlans = [
  {
    id: "plan_starter",
    name: "Starter",
    price: 29,
    interval: "monthly",
    features: ["5 projects", "Basic analytics", "Email support"],
  },
  {
    id: "plan_pro",
    name: "Pro",
    price: 99,
    interval: "monthly",
    features: ["Unlimited projects", "Advanced analytics", "Priority support", "API access"],
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    price: 299,
    interval: "monthly",
    features: ["Everything in Pro", "Custom dashboards", "White-label reports", "Dedicated support"],
  },
];

export const ChangePlanDialog = ({ open, onOpenChange, subscription, onChangePlan }) => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [changing, setChanging] = useState(false);

  if (!subscription) return null;

  const handleChangePlan = async () => {
    if (!selectedPlan) return;

    setChanging(true);
    // Simulate API call - replace with actual backend call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Plan changed successfully!",
      description: `Your subscription has been changed to ${selectedPlan.name}.`,
    });

    onChangePlan?.(subscription, selectedPlan);
    setChanging(false);
    setSelectedPlan(null);
    onOpenChange(false);
  };

  const currentPlanName = subscription.name;
  const isUpgrade = selectedPlan && selectedPlan.price > subscription.amount;
  const isDowngrade = selectedPlan && selectedPlan.price < subscription.amount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Change Plan</DialogTitle>
          <DialogDescription>
            Select a new plan for your {subscription.name} subscription
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {availablePlans.map((plan) => {
            const isCurrent = plan.name === currentPlanName;
            const isSelected = selectedPlan?.id === plan.id;

            return (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : ""
                  } ${isCurrent ? "bg-muted/50" : "hover:border-primary/50"}`}
                onClick={() => !isCurrent && setSelectedPlan(plan)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {plan.name}
                      {isCurrent && <Badge variant="secondary">Current Plan</Badge>}
                    </CardTitle>
                    <span className="font-bold">
                      ₹{plan.price}<span className="text-muted-foreground font-normal">/mo</span>
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                        <Check className="h-3 w-3 text-primary" />
                        {feature}
                      </span>
                    ))}
                    {plan.features.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{plan.features.length - 3} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedPlan && (
          <div className="flex items-center justify-center gap-3 p-3 bg-muted rounded-lg">
            <span className="text-sm">{currentPlanName}</span>
            <ArrowRight className="h-4 w-4" />
            <span className="font-medium">{selectedPlan.name}</span>
            {isUpgrade && <Badge variant="success">Upgrade</Badge>}
            {isDowngrade && <Badge variant="warning">Downgrade</Badge>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="gradient"
            onClick={handleChangePlan}
            disabled={!selectedPlan || changing}
          >
            {changing ? "Changing..." : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
