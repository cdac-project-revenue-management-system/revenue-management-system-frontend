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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// TODO: Import API service when backend is ready
// import { paymentMethodsApi } from "@/services/api";

export const AddPaymentMethodDialog = ({ open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("card");
  const [isLoading, setIsLoading] = useState(false);
  
  // Card form state
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  // Bank account form state
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    ifscNumber: "",
    accountNumber: "",
    bankName: "",
  });

  const resetForm = () => {
    setCardDetails({ number: "", expiry: "", cvc: "", name: "" });
    setBankDetails({ accountHolder: "", ifscNumber: "", accountNumber: "", bankName: "" });
    setActiveTab("card");
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ==========================================
      // TODO: API CALL - Add Credit Card
      // Replace this mock with actual API call:
      // const response = await paymentMethodsApi.create({
      //   type: "card",
      //   cardNumber: cardDetails.number,
      //   expiryDate: cardDetails.expiry,
      //   cvv: cardDetails.cvc,
      //   cardholderName: cardDetails.name,
      // });
      // onSuccess?.(response.data);
      // ==========================================
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response for now
      const last4 = cardDetails.number.slice(-4);
      const newPaymentMethod = {
        id: `PM-${Date.now()}`,
        type: "card",
        last4,
        brand: "Visa", // Would be detected by payment processor
        expiryDate: cardDetails.expiry,
        isDefault: false,
      };
      onSuccess?.(newPaymentMethod);
      toast({ title: "Card added successfully" });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      // ==========================================
      // TODO: Handle API errors
      // toast({ title: "Error", description: error.response?.data?.message || "Failed to add card", variant: "destructive" });
      // ==========================================
      toast({ title: "Error", description: "Failed to add card", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ==========================================
      // TODO: API CALL - Add Bank Account
      // Replace this mock with actual API call:
      // const response = await paymentMethodsApi.create({
      //   type: "bank",
      //   accountNumber: bankDetails.accountNumber,
      //   ifscNumber: bankDetails.ifscNumber,
      //   accountHolderName: bankDetails.accountHolder,
      //   bankName: bankDetails.bankName,
      // });
      // onSuccess?.(response.data);
      // ==========================================
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response for now
      const last4 = bankDetails.accountNumber.slice(-4);
      const newPaymentMethod= {
        id: `PM-${Date.now()}`,
        type: "bank",
        last4,
        bankName: bankDetails.bankName,
        isDefault: false,
      };
      onSuccess?.(newPaymentMethod);
      toast({ title: "Bank account added successfully" });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      // ==========================================
      // TODO: Handle API errors
      // toast({ title: "Error", description: error.response?.data?.message || "Failed to add bank account", variant: "destructive" });
      // ==========================================
      toast({ title: "Error", description: "Failed to add bank account", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const isCardValid = cardDetails.number && cardDetails.expiry && cardDetails.cvc && cardDetails.name;
  const isBankValid = bankDetails.accountHolder && bankDetails.ifscNumber && bankDetails.accountNumber && bankDetails.bankName;

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a new credit card or bank account for payments.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Card
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Bank Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card">
            <form onSubmit={handleAddCard}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name on Card</Label>
                  <Input
                    id="name"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                    placeholder="4242 4242 4242 4242"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      placeholder="MM/YY"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      type="password"
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder="123"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" disabled={!isCardValid || isLoading}>
                  {isLoading ? "Adding..." : "Add Card"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="bank">
            <form onSubmit={handleAddBank}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input
                    id="accountHolder"
                    value={bankDetails.accountHolder}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    placeholder="Chase Bank"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ifscNumber">IFSC Code</Label>
                    <Input
                      id="ifscNumber"
                      value={bankDetails.ifscNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, ifscNumber: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                      placeholder="021000021"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 17) })}
                      placeholder="123456789"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" disabled={!isBankValid || isLoading}>
                  {isLoading ? "Adding..." : "Add Bank Account"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
