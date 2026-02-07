import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Building2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { plansService, subscriptionsService, paymentService, companiesService } from "@/services";

export const ExplorePlansDialog = ({ open, onOpenChange, onSubscribe }) => {
  const { toast } = useToast();

  // Data States
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('companies'); // 'companies', 'plans', 'confirm'
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscribing, setSubscribing] = useState(null);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setStep('companies');
      setSelectedCompany(null);
      setSelectedPlan(null);
      fetchCompanies();
    }
  }, [open]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await companiesService.getAll();
      setCompanies(data);
    } catch (error) {
      console.error("Failed to fetch companies", error);
      toast({ title: "Error", description: "Failed to load companies", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlansForCompany = async (companyId) => {
    setLoading(true);
    try {
      const data = await plansService.getByCompany(companyId);
      // Map backend plans to component format
      const mappedPlans = data.map(plan => ({
        id: plan.formattedId || plan.id,
        originalId: plan.id,
        name: plan.name,
        description: plan.description || `Plan for product: ${plan.product}`,
        price: plan.price,
        interval: plan.interval ? plan.interval.toLowerCase() : "monthly",
        features: plan.features || ["Standard Features"],
        popular: plan.isPopular || false
      }));
      setPlans(mappedPlans);
    } catch (error) {
      console.error("Failed to fetch plans", error);
      toast({ title: "Error", description: "Failed to load plans", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setStep('plans');
    fetchPlansForCompany(company.id);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setStep('confirm');
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('plans');
      setSelectedPlan(null);
    } else if (step === 'plans') {
      setStep('companies');
      setSelectedCompany(null);
      setPlans([]);
    }
  };

  const handlePayment = async () => {
    const plan = selectedPlan;
    if (!plan) return;

    // Close the dialog immediately as requested
    onOpenChange(false);

    setSubscribing(plan.id);
    try {
      const userStr = localStorage.getItem("user");
      let user = null;
      let clientId = null;
      if (userStr) {
        try {
          user = JSON.parse(userStr);
          clientId = user.id;
        } catch (e) {
          console.error("Error parsing user", e);
        }
      }

      if (!clientId) {
        toast({ title: "Error", description: "User session invalid. Please login again.", variant: "destructive" });
        return;
      }

      // 1. Create Order on Backend
      const orderData = await paymentService.createOrder(plan.price);

      let order = orderData;
      if (typeof orderData === 'string') {
        try {
          order = JSON.parse(orderData);
        } catch (e) { /* ignore */ }
      }

      const options = {
        key: "rzp_test_SACSdHxBz2ucY1", // TEST KEY
        amount: order.amount,
        currency: order.currency,
        name: "BizVenue",
        description: `Subscription to ${plan.name}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            toast({ title: "Processing...", description: "Verifying payment..." });

            // 2. Verify Payment
            const verification = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verification.valid) {
              // 3. Create Subscription
              const payload = {
                planId: plan.originalId,
                clientId: clientId
              };

              await subscriptionsService.create(payload);

              toast({
                title: "Subscription started!",
                description: `You've successfully subscribed to ${plan.name}.`,
              });

              onSubscribe?.(payload);
              onOpenChange(false);
            } else {
              toast({ title: "Error", description: "Payment verification failed", variant: "destructive" });
            }
          } catch (error) {
            console.error("Verification/Creation failed", error);
            toast({ title: "Error", description: "Failed to activate subscription", variant: "destructive" });
          } finally {
            setSubscribing(null);
          }
        },
        prefill: {
          name: user ? user.fullName : "",
          email: user ? user.email : "",
          contact: ""
        },
        theme: {
          color: "#0F172A"
        },
        modal: {
          ondismiss: function () {
            setSubscribing(null);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        toast({ title: "Payment Failed", description: response.error.description, variant: "destructive" });
        setSubscribing(null);
      });
      rzp1.open();

    } catch (error) {
      console.error("Subscription flow failed", error);
      toast({ title: "Error", description: "Failed to initiate payment.", variant: "destructive" });
      setSubscribing(null);
    }
  };

  const handlePayLater = async () => {
    const plan = selectedPlan;
    if (!plan) return;

    setSubscribing(plan.id);

    try {
      const userStr = localStorage.getItem("user");
      let user = null;
      let clientId = null;
      if (userStr) {
        try {
          user = JSON.parse(userStr);
          clientId = user.id;
        } catch (e) {
          console.error("Error parsing user", e);
        }
      }

      if (!clientId) {
        toast({ title: "Error", description: "User session invalid. Please login again.", variant: "destructive" });
        return;
      }

      const payload = {
        planId: plan.originalId,
        clientId: clientId,
        status: 'PENDING'
      };

      await subscriptionsService.create(payload);

      toast({
        title: "Subscription Created",
        description: `Subscription for ${plan.name} created. You can pay later from Invoices.`,
      });

      onSubscribe?.(payload);
      onOpenChange(false);
      setSelectedPlan(null);

    } catch (error) {
      console.error("Pay Later failed", error);
      toast({ title: "Error", description: "Failed to create subscription.", variant: "destructive" });
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step !== 'companies' && (
              <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="text-2xl">
              {step === 'companies' ? 'Select a Provider' : step === 'plans' ? `Plans from ${selectedCompany?.companyName}` : 'Confirm Subscription'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {step === 'companies' ? "Choose a company to view their available plans" : step === 'plans' ? "Choose the plan that best fits your needs" : "Review and complete your subscription"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : step === 'companies' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 py-4">
            {companies.map((company) => (
              <Card
                key={company.id}
                className="cursor-pointer hover:border-primary transition-colors flex flex-col items-center text-center p-4"
                onClick={() => handleSelectCompany(company)}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{company.companyName}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
                  {company.email || "Business Provider"}
                </CardDescription>
                <Button variant="ghost" className="mt-4 w-full">View Plans</Button>
              </Card>
            ))}
            {companies.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No companies available at the moment.
              </div>
            )}
          </div>
        ) : step === 'plans' ? (
          <div className="grid gap-4 md:grid-cols-3 py-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${plan.popular ? "ring-2 ring-primary" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-primary shadow-lg" variant="default">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pt-6">
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="line-clamp-2 h-10">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">₹{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval === "monthly" ? "mo" : "yr"}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span className="line-clamp-1">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-auto"
                    variant={plan.popular ? "gradient" : "outline"}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
            {plans.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No plans available from {selectedCompany?.companyName}.
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Confirm Subscription</h3>
              <p className="text-muted-foreground">You are about to subscribe to the <span className="font-bold text-foreground">{selectedPlan.name}</span> plan from <span className="font-bold">{selectedCompany?.companyName}</span>.</p>
            </div>

            <Card className="max-w-md mx-auto border-2 border-primary/20">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{selectedPlan?.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">₹{selectedPlan?.price}</span>
                  <span className="text-muted-foreground">/{selectedPlan?.interval === "monthly" ? "mo" : "yr"}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {selectedPlan?.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {selectedPlan?.features.length > 3 && (
                    <li className="text-xs text-muted-foreground pl-6">
                      + {selectedPlan?.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleBack}
                  disabled={subscribing === selectedPlan?.id}
                >
                  Back
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handlePayLater}
                  disabled={subscribing === selectedPlan?.id}
                >
                  {subscribing === selectedPlan?.id ? "Processing..." : "Pay Later"}
                </Button>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
                onClick={handlePayment}
                disabled={subscribing === selectedPlan?.id}
              >
                Pay Now (₹{selectedPlan?.price})
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
