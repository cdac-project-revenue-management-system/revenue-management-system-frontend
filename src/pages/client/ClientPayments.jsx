import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Star,
  CheckCircle,
  Building2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AddPaymentMethodDialog } from "@/components/dialogs/AddPaymentMethodDialog";

// UNCOMMENT: Import services when backend is ready
// import { paymentMethodsService, billingService } from "@/services/api";
// import type { BillingHistory } from "@/services/api";

// ==========================================
// Mock data - Remove when backend is connected
// ==========================================
const mockPaymentMethods = [
  { id: "pm_1", type: "card", last4: "4242", brand: "Visa", expiryDate: "12/26", isDefault: true },
  { id: "pm_2", type: "card", last4: "5555", brand: "Mastercard", expiryDate: "08/25", isDefault: false },
  { id: "pm_3", type: "bank", last4: "6789", bankName: "Chase Bank", isDefault: false },
];

const mockBillingHistory = [
  { id: "tx_1", date: "Dec 15, 2024", description: "Monthly subscription", method: "Visa •••• 4242", amount: 347.00, status: "success" },
  { id: "tx_2", date: "Nov 15, 2024", description: "Monthly subscription", method: "Visa •••• 4242", amount: 347.00, status: "success" },
  { id: "tx_3", date: "Oct 15, 2024", description: "Monthly subscription", method: "Visa •••• 4242", amount: 347.00, status: "success" },
  { id: "tx_4", date: "Sep 15, 2024", description: "Monthly subscription", method: "Visa •••• 4242", amount: 347.00, status: "success" },
  { id: "tx_5", date: "Aug 15, 2024", description: "Monthly subscription", method: "Visa •••• 4242", amount: 148.00, status: "success" },
];

const statusConfig = {
  success: { label: "Success", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
  refunded: { label: "Refunded", variant: "secondary" },
};

const ClientPayments = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [billingHistory, setBillingHistory] = useState(mockBillingHistory);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ==========================================
  // UNCOMMENT: Fetch data from API on mount
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // UNCOMMENT: API calls
        // const [paymentMethodsData, billingHistoryData] = await Promise.all([
        //   paymentMethodsService.getAll(),
        //   billingService.getHistory()
        // ]);
        // setPaymentMethods(paymentMethodsData);
        // setBillingHistory(billingHistoryData);
        
        // REMOVE: Mock data loading
        setPaymentMethods(mockPaymentMethods);
        setBillingHistory(mockBillingHistory);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSetDefault = async (method) => {
    try {
      // UNCOMMENT: API call
      // await paymentMethodsService.setDefault(method.id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPaymentMethods(prev =>
        prev.map(m => ({
          ...m,
          isDefault: m.id === method.id,
        }))
      );
      
      toast({
        title: "Default payment method updated",
        description: `${method.type === "card" ? method.brand : method.bankName} •••• ${method.last4} is now your default.`,
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update default payment method", variant: "destructive" });
    }
  };

  const handleDeleteClick = (method) => {
    if (method.isDefault) {
      toast({
        title: "Cannot delete default method",
        description: "Please set another payment method as default first.",
        variant: "destructive",
      });
      return;
    }
    setSelectedMethod(method);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMethod) return;
    
    setDeleting(true);
    
    try {
      // UNCOMMENT: API call
      // await paymentMethodsService.delete(selectedMethod.id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPaymentMethods(prev => prev.filter(m => m.id !== selectedMethod.id));
      
      toast({
        title: "Payment method removed",
        description: `${selectedMethod.type === "card" ? selectedMethod.brand : selectedMethod.bankName} •••• ${selectedMethod.last4} has been removed.`,
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove payment method", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedMethod(null);
    }
  };

  const handleAddPaymentMethod = (newMethod) => {
    // If no payment methods exist, set this one as default
    if (paymentMethods.length === 0) {
      newMethod.isDefault = true;
    }
    setPaymentMethods(prev => [...prev, newMethod]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Methods</h1>
          <p className="text-muted-foreground mt-1">Manage your payment methods and view billing history</p>
        </div>
        <Button variant="gradient" onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paymentMethods.map((method) => (
          <Card key={method.id} className={method.isDefault ? "ring-2 ring-primary" : ""}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {method.type === "card" ? <CreditCard className="h-5 w-5 text-primary" /> : <Building2 className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <CardTitle className="text-base">{method.type === "card" ? method.brand : method.bankName}</CardTitle>
                  <CardDescription>•••• {method.last4}</CardDescription>
                </div>
              </div>
              {method.isDefault && (
                <Badge variant="secondary"><Star className="mr-1 h-3 w-3" />Default</Badge>
              )}
            </CardHeader>
            <CardContent>
              {method.expiryDate && <p className="text-sm text-muted-foreground mb-4">Expires {method.expiryDate}</p>}
              {method.type === "bank" && <p className="text-sm text-muted-foreground mb-4">Bank Account</p>}
              <div className="flex gap-2">
                {!method.isDefault && (
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleSetDefault(method)}>Set as Default</Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteClick(method)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed cursor-pointer hover:border-primary transition-colors" onClick={() => setAddDialogOpen(true)}>
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[180px] text-muted-foreground">
            <Plus className="h-8 w-8 mb-2" />
            <p className="font-medium">Add Payment Method</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View all your past transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>{tx.method}</TableCell>
                  <TableCell className="font-medium">${tx.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[tx.status].variant}>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {statusConfig[tx.status].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddPaymentMethodDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={handleAddPaymentMethod} />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedMethod?.type === "card" ? selectedMethod?.brand : selectedMethod?.bankName} •••• {selectedMethod?.last4}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>{deleting ? "Removing..." : "Remove"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientPayments;
