import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  FileText,
  Calendar,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { subscriptionsService, invoicesService } from "@/services";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ fullName: "Client" });
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    subscriptions: [],
    invoices: [],
    stats: {
      activeSubs: 0,
      pendingInvoiceCount: 0,
      pendingInvoiceAmount: 0,
      nextBillingDate: null,
      totalSpent: 0
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem("user");
        let clientId = null;
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            clientId = parsed.id;
          } catch (e) {
            console.error("Failed to parse user data");
          }
        }

        if (!clientId) {
          setLoading(false);
          return;
        }

        const [subsData, invoicesData] = await Promise.all([
          subscriptionsService.getAll(), // We filter these manually
          invoicesService.getAll()       // We filter these manually
        ]);

        // Filter for client
        const clientSubs = subsData.filter(s => s.client?.id === clientId || s.clientId === clientId);
        const clientInvoices = invoicesData.filter(inv => inv.client?.id === clientId || inv.clientId === clientId);

        // Calculate Stats
        const activeSubs = clientSubs.filter(s => s.status?.toLowerCase() === "active");
        const pendingInvoices = clientInvoices.filter(inv => inv.status?.toLowerCase() === "pending");

        let nextBillingDate = "N/A";
        if (activeSubs.length > 0) {
          // Find earliest next billing
          const dates = activeSubs
            .map(s => s.nextBilling)
            .filter(d => d)
            .map(d => {
              if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
              return new Date(d);
            })
            .filter(d => !isNaN(d.getTime()))
            .sort((a, b) => a - b);

          if (dates.length > 0) {
            nextBillingDate = dates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }
        }

        const stats = {
          activeSubs: activeSubs.length,
          pendingInvoiceCount: pendingInvoices.length,
          pendingInvoiceAmount: pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0),
          nextBillingDate: nextBillingDate,
          totalSpent: clientInvoices.filter(inv => inv.status?.toLowerCase() === "paid").reduce((sum, inv) => sum + inv.amount, 0)
        };

        // Format dates for display
        const formatDate = (d) => {
          if (!d) return "N/A";
          if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]).toLocaleDateString();
          const date = new Date(d);
          return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
        };

        setDashboardData({
          subscriptions: clientSubs.map(s => ({
            ...s,
            nextBilling: formatDate(s.nextBilling),
            status: s.statusString || s.status?.toLowerCase()
          })),
          invoices: clientInvoices.map(i => ({
            ...i,
            date: formatDate(i.issueDate),
            status: i.statusString || i.status?.toLowerCase()
          })),
          stats
        });

      } catch (error) {
        console.error("Error loading dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // "New Client" Empty State
  if (dashboardData.subscriptions.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome, {user.fullName}!</h1>
          <p className="text-muted-foreground mt-1">
            Let's get you started with a subscription.
          </p>
        </div>

        <Card className="border-dashed border-2 p-8 text-center bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2 max-w-lg">
              <h2 className="text-2xl font-bold">Choose your plan</h2>
              <p className="text-muted-foreground">
                You don't have any active subscriptions. Browse our plans to find the features that best suit your needs and start your journey with us.
              </p>
            </div>
            <Button size="lg" variant="gradient" onClick={() => navigate("/client/subscriptions")}>
              View Plans <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.fullName}!</h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your account and subscriptions
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.activeSubs}</div>
            <p className="text-xs text-muted-foreground">All in good standing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.pendingInvoiceCount}</div>
            <p className="text-xs text-muted-foreground">₹{dashboardData.stats.pendingInvoiceAmount.toFixed(2)} due</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.nextBillingDate || "N/A"}</div>
            <p className="text-xs text-muted-foreground">Upcoming charge</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardData.stats.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Subscriptions</CardTitle>
            <CardDescription>Manage your active subscriptions</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link to="/client/subscriptions">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.subscriptions.slice(0, 3).map((sub, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{sub.plan}</p>
                    <p className="text-sm text-muted-foreground">{sub.product}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{sub.amount}/{sub.interval === "monthly" ? "mo" : "yr"}</p>
                  <p className="text-sm text-muted-foreground">Next: {sub.nextBilling}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Your latest billing activity</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/client/invoices">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.invoices.slice(0, 3).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {invoice.status === "paid" ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Clock className="h-4 w-4 text-warning" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{invoice.id}</p>
                      <p className="text-xs text-muted-foreground">{invoice.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">₹{invoice.amount}</span>
                    <Badge variant={invoice.status === "paid" ? "success" : "warning"}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {dashboardData.invoices.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent invoices.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link to="/client/payments">
                  <CreditCard className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Manage Payment Methods</p>
                    <p className="text-xs text-muted-foreground">Add or update your cards</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link to="/client/subscriptions">
                  <TrendingUp className="mr-3 h-5 w-5 text-info" />
                  <div className="text-left">
                    <p className="font-medium">Upgrade Your Plan</p>
                    <p className="text-xs text-muted-foreground">Unlock more features</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link to="/client/support">
                  <AlertCircle className="mr-3 h-5 w-5 text-warning" />
                  <div className="text-left">
                    <p className="font-medium">Get Support</p>
                    <p className="text-xs text-muted-foreground">Contact our help center</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
