import { useEffect, useState } from "react";
import { MetricCard } from "../components/dashboard/MetricCard";
import { RevenueChart } from "../components/dashboard/RevenueChart";
import { SubscriptionChart } from "../components/dashboard/SubscriptionChart";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { TopProducts } from "../components/dashboard/TopProducts";
import { analyticsService } from "../services/analytics.service";
import {
  IndianRupee,
  Users,
  CreditCard,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Loader2
} from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) throw new Error("User not found");

        const user = JSON.parse(userStr);
        // Assuming user.id corresponds to company_id as per schema inheritance
        const dashboardData = await analyticsService.getDashboardData(user.id);
        setData(dashboardData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  const { stats, revenueChart, subscriptionChart, recentActivity, topProducts } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your revenue overview.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Monthly Revenue"
          value={`₹${stats?.monthlyRevenue?.toLocaleString() ?? 0}`}
          change={12.5}
          icon={<IndianRupee className="h-5 w-5" />}
          iconColor="text-primary"
        />
        <MetricCard
          title="MRR"
          value={`₹${Number(stats?.mrr || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={null}
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="text-success"
        />
        <MetricCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions ?? 0}
          change={null}
          icon={<CreditCard className="h-5 w-5" />}
          iconColor="text-info"
        />
        <MetricCard
          title="Total Clients"
          value={stats?.totalClients ?? 0}
          change={null}
          icon={<Users className="h-5 w-5" />}
          iconColor="text-chart-5"
        />
        <MetricCard
          title="Churn Rate"
          value={stats?.churnRate ?? "0%"}
          change={null}
          icon={<RefreshCw className="h-5 w-5" />}
          iconColor="text-warning"
        />
        <MetricCard
          title="Failed Payments"
          value={stats?.failedPayments ?? 0}
          change={null}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconColor="text-destructive"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={revenueChart} />
        <SubscriptionChart data={subscriptionChart} />
      </div>

      {/* Activity & Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity data={recentActivity} />
        <TopProducts data={topProducts} />
      </div>
    </div>
  );
};

export default Dashboard;
