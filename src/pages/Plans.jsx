import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Check, Layers, Edit, Trash2 } from "lucide-react";
import { PlanDialog } from "@/components/dialogs/PlanDialog";
import { useToast } from "@/hooks/use-toast";
import { plansService, productsService } from "@/services";

// ==========================================
// Mock data - Remove when backend is connected
// ==========================================
const Plans = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState();

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

        const [plansData, productsData] = await Promise.all([
          plansService.getAll(params),
          productsService.getAll(params)
        ]);

        const processedPlans = plansData.map(plan => ({
          ...plan,
          id: plan.formattedId || plan.id,
          originalId: plan.id,
          status: plan.statusString || plan.status.toLowerCase(),
          interval: plan.intervalString || plan.interval.toLowerCase()
        }));

        setPlans(processedPlans);
        setProducts(productsData);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const planToDelete = plans.find(p => p.id === id || p.originalId === id);
      if (!planToDelete) return;

      await plansService.delete(planToDelete.originalId);

      setPlans(prev => prev.filter(p => p.id !== id));
      toast({ title: "Plan deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete plan", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (plan) => {
    const newStatus = plan.status === "active" ? "inactive" : "active";
    // Check if backend supports string status toggle, or send standard casing
    try {
      // Assuming toggleStatus takes the ID and the new status string
      // Using originalId for backend calls
      await plansService.toggleStatus(plan.originalId, newStatus.toUpperCase());

      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: newStatus } : p));
    } catch (error) {
      toast({ title: "Error", description: "Failed to update plan status", variant: "destructive" });
    }
  };

  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) setEditingPlan(undefined);
  };

  const handlePlanSuccess = (plan) => {
    const processedPlan = {
      ...plan,
      id: plan.formattedId || plan.id,
      originalId: plan.id,
      status: plan.statusString || plan.status?.toLowerCase(),
      interval: plan.intervalString || plan.interval?.toLowerCase()
    };
    if (editingPlan) {
      setPlans(prev => prev.map(p => p.originalId === processedPlan.originalId ? processedPlan : p));
    } else {
      setPlans(prev => [...prev, processedPlan]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Plans</h1>
          <p className="text-muted-foreground mt-1">Configure pricing plans for your products</p>
        </div>
        <Button variant="gradient" className="gap-2 w-full md:w-auto" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} variant="bordered" className={`relative hover:shadow-elevated transition-all duration-300 ${plan.isPopular ? "border-primary shadow-glow" : ""}`}>
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="bg-gradient-primary shadow-lg">Most Popular</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{plan.product}</Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{plan.status === "active" ? "Active" : "Inactive"}</span>
                  <Switch checked={plan.status === "active"} onCheckedChange={() => handleToggleStatus(plan)} />
                </div>
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                {plan.name}
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">₹{plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{plan.subscribers} active subscribers</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="pt-4 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleEdit(plan)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(plan.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PlanDialog open={dialogOpen} onOpenChange={handleDialogClose} plan={editingPlan} products={products} onSuccess={handlePlanSuccess} />
    </div>
  );
};

export default Plans;
