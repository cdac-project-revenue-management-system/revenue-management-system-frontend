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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
// TODO: Import API service when backend is ready
import { plansService } from "@/services";

export const PlanDialog = ({ open, onOpenChange, plan, products, onSuccess }) => {
  const { toast } = useToast();
  const isEdit = !!plan;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    interval: "monthly",
    features: "",
    isPopular: false,
    status: "active",
    product: "",
  });

  // Reset form when dialog opens/closes or plan changes
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        price: plan.price,
        interval: plan.interval,
        features: Array.isArray(plan.features) ? plan.features.join("\n") : (plan.features || ""),
        isPopular: plan.isPopular,
        status: plan.status,
        product: plan.product,
      });
    } else {
      setFormData({
        name: "",
        price: 0,
        interval: "monthly",
        features: "",
        isPopular: false,
        status: "active",
        product: "",
      });
    }
  }, [plan, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const selectedProduct = products.find(p => p.name === formData.product);
    if (!selectedProduct) {
      toast({ title: "Error", description: "Please select a valid product", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const planData = {
      ...formData,
      features: formData.features.split("\n").filter(f => f.trim() !== ""),
      subscribers: plan?.subscribers || 0,
      productId: selectedProduct.originalId || selectedProduct.id, // ID for backend
      status: formData.status.toUpperCase(), // Enum: ACTIVE, INACTIVE
      interval: formData.interval.toUpperCase() // Enum: MONTHLY, YEARLY
    };

    try {
      if (isEdit && plan) {
        // API Call
        const updatedPlan = await plansService.update(plan.originalId, planData);
        onSuccess?.(updatedPlan);
        toast({ title: "Plan updated successfully" });
      } else {
        // API Call
        const newPlan = await plansService.create(planData);
        onSuccess?.(newPlan);
        toast({ title: "Plan created successfully" });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Plan Error:", error);
      toast({ title: "Error", description: error?.response?.data?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter active products
  const activeProducts = products.filter(p => p.status === "active");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Plan" : "Create New Plan"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the plan details below." : "Create a new pricing plan."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Professional"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product">Product</Label>
              <Select value={formData.product} onValueChange={(value) => setFormData({ ...formData, product: value })} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.name}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interval">Billing Interval</Label>
                <Select
                  value={formData.interval}
                  onValueChange={(value) => setFormData({ ...formData, interval: value })}
                  disabled={isLoading}
                >
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
            <div className="grid gap-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Enter features, one per line"
                rows={4}
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="isPopular"
                  checked={formData.isPopular}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
                  disabled={isLoading}
                />
                <Label htmlFor="isPopular">Mark as Popular</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isLoading}>
              {isLoading ? "Saving..." : `${isEdit ? "Update" : "Create"} Plan`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
