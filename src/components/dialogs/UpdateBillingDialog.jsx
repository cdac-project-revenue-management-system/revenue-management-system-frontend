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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Building2, Check, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock payment methods - replace with actual data from backend
const paymentMethods = [
  { id: "pm_1", type: "card", last4: "4242", brand: "Visa", expiry: "12/26", isDefault: true },
  { id: "pm_2", type: "card", last4: "5555", brand: "Mastercard", expiry: "08/25", isDefault: false },
  { id: "pm_3", type: "bank", last4: "6789", bankName: "Chase Bank", isDefault: false },
];

export const UpdateBillingDialog = ({ open, onOpenChange, subscription, onUpdateBilling }) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [updating, setUpdating] = useState(false);

  if (!subscription) return null;

  const handleUpdateBilling = async () => {
    if (!selectedMethod) return;
    
    setUpdating(true);
    // Simulate API call - replace with actual backend call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Billing updated!",
      description: "Your payment method has been updated for this subscription.",
    });
    
    onUpdateBilling?.(subscription, selectedMethod);
    setUpdating(false);
    setSelectedMethod(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Billing</DialogTitle>
          <DialogDescription>
            Choose a payment method for {subscription.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {paymentMethods.map((method) => (
            <Card 
              key={method.id}
              className={`cursor-pointer transition-all ${
                selectedMethod === method.id ? "ring-2 ring-primary" : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {method.type === "card" ? (
                      <CreditCard className="h-5 w-5 text-primary" />
                    ) : (
                      <Building2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {method.type === "card" ? method.brand : method.bankName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      •••• {method.last4}
                      {method.expiry && ` • Expires ${method.expiry}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.isDefault && (
                    <Badge variant="secondary">
                      <Star className="mr-1 h-3 w-3" />
                      Default
                    </Badge>
                  )}
                  {selectedMethod === method.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            variant="gradient" 
            onClick={handleUpdateBilling}
            disabled={!selectedMethod || updating}
          >
            {updating ? "Updating..." : "Update Billing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
