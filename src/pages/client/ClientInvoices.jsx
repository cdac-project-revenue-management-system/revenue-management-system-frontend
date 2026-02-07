import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  XCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invoicesService, paymentService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { InvoiceDetailsDialog } from "@/components/dialogs/InvoiceDetailsDialog";

const statusConfig = {
  paid: { label: "Paid", variant: "success", icon: CheckCircle },
  pending: { label: "Pending", variant: "warning", icon: Clock },
  overdue: { label: "Overdue", variant: "destructive", icon: AlertCircle },
  draft: { label: "Draft", variant: "secondary", icon: FileText },
  cancelled: { label: "Cancelled", variant: "secondary", icon: XCircle },
};

const ClientInvoices = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog states
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
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
          setInvoices([]);
          return;
        }

        const data = await invoicesService.getAll();

        // Filter for current client
        const clientInvoices = data.filter(inv => inv.client?.id === clientId || inv.clientId === clientId);

        // Helper to safely format dates
        const formatDate = (dateInput) => {
          if (!dateInput) return "N/A";
          try {
            if (Array.isArray(dateInput)) {
              return new Date(dateInput[0], dateInput[1] - 1, dateInput[2]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            }
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return "N/A";
            return format(date, "MMM dd, yyyy");
          } catch (e) {
            return "N/A";
          }
        };

        const processedInvoices = clientInvoices.map(inv => ({
          ...inv,
          id: inv.formattedId || inv.id,
          originalId: inv.id,
          status: inv.statusString || inv.status?.toLowerCase() || "pending",
          date: formatDate(inv.issueDate),
          dueDate: formatDate(inv.dueDate),
          amount: inv.amount,
          description: inv.items > 0 ? `${inv.items} Items` : "Subscription Invoice", // Simple fallback description
        }));

        setInvoices(processedInvoices);
      } catch (error) {
        console.error("Failed to fetch invoices", error);
        toast({ title: "Error", description: "Failed to load invoices", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [toast]);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = (invoice.id?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (invoice.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((sum, i) => sum + i.amount, 0);

  const handleDownload = async (invoice) => {
    try {
      const blob = await invoicesService.download(invoice.originalId || invoice.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${invoice.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast({ title: "Downloaded PDF", description: `Invoice ${invoice.id}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to download PDF", variant: "destructive" });
    }
  };

  const handlePayInvoice = async (invoice) => {
    setPaying(invoice.id);
    try {
      // 1. Create Order
      const orderData = await paymentService.createOrder(invoice.amount);

      let order = orderData;
      if (typeof orderData === 'string') {
        try {
          order = JSON.parse(orderData);
        } catch (e) { /* ignore */ }
      }

      // 2. Open Razorpay
      const options = {
        key: "rzp_test_SACSdHxBz2ucY1", // TEST KEY
        amount: order.amount,
        currency: order.currency,
        name: "BizVenue",
        description: `Payment for Invoice #${invoice.id}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            toast({ title: "Processing...", description: "Verifying payment..." });

            // 3. Verify Payment
            const verification = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verification.valid) {
              // 4. Mark Invoice as Paid in Backend
              await invoicesService.pay(invoice.originalId || invoice.id);

              toast({
                title: "Payment Successful",
                description: `Invoice #${invoice.id} paid successfully.`,
              });

              // Update local state to reflect change immediately
              setInvoices(prev => prev.map(inv =>
                inv.id === invoice.id ? { ...inv, status: 'paid' } : inv
              ));
            } else {
              toast({ title: "Error", description: "Payment verification failed", variant: "destructive" });
            }
          } catch (error) {
            console.error("Payment failed", error);
            toast({ title: "Error", description: "Failed to process payment", variant: "destructive" });
          } finally {
            setPaying(null);
          }
        },
        prefill: {
          // We could fill user details here if we had them handy in the map, 
          // but keeping it simple is fine for now.
        },
        theme: {
          color: "#0F172A"
        },
        modal: {
          ondismiss: function () {
            setPaying(null);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        toast({ title: "Payment Failed", description: response.error.description, variant: "destructive" });
        setPaying(null);
      });
      rzp1.open();

    } catch (error) {
      console.error("Pay invoice failed", error);
      toast({ title: "Error", description: "Could not initiate payment", variant: "destructive" });
      setPaying(null);
    }
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Invoices</h1>
        <p className="text-muted-foreground mt-1">
          View and download your billing history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card variant="gradient">
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Paid</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-success">₹{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card variant="gradient">
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-warning">₹{totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card variant="gradient" className="col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="text-xl md:text-2xl lg:text-3xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="bordered">
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap px-4 md:px-6">Invoice</TableHead>
                  <TableHead className="whitespace-nowrap px-4 md:px-6">Date</TableHead>
                  <TableHead className="whitespace-nowrap px-4 md:px-6">Due Date</TableHead>
                  <TableHead className="whitespace-nowrap px-4 md:px-6">Description</TableHead>
                  <TableHead className="whitespace-nowrap px-4 md:px-6">Amount</TableHead>
                  <TableHead className="whitespace-nowrap px-4 md:px-6">Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap px-4 md:px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const config = statusConfig[invoice.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium px-4 md:px-6">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          {invoice.id}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 md:px-6">{invoice.date}</TableCell>
                      <TableCell className="whitespace-nowrap px-4 md:px-6">{invoice.dueDate}</TableCell>
                      <TableCell className="min-w-[200px] px-4 md:px-6">{invoice.description}</TableCell>
                      <TableCell className="font-semibold px-4 md:px-6">₹{invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="px-4 md:px-6">
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-4 md:px-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.status === "paid" && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => handleView(invoice)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => handleDownload(invoice)}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {invoice.status === "pending" && (
                            <Button
                              size="sm"
                              variant="gradient"
                              className="h-8"
                              onClick={() => handlePayInvoice(invoice)}
                              disabled={paying === invoice.id}
                            >
                              {paying === invoice.id ? "Paying..." : "Pay Now"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No invoices found.
            </div>
          )}
        </CardContent>
      </Card>

      <InvoiceDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} invoice={selectedInvoice} />
    </div>
  );
};
export default ClientInvoices;
