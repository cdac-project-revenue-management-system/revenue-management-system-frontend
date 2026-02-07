import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { TrendingUp, TrendingDown, IndianRupee, Users, RefreshCw, Loader2 } from "lucide-react";
import { analyticsService } from "../services/analytics.service";

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const result = await analyticsService.getAnalyticsPageData(user.id);
          setData(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return <div className="p-6">Error loading data</div>;

  const { mrrData, churnData, revenueByPlan, arpcData } = data;

  // Calculate latest MRR and growth from mrrData
  const latestMrr = mrrData?.length > 0 ? mrrData[mrrData.length - 1].date_mrr : 0;
  // Wait, backend returns {month, revenue, mrr}.
  const lastMrr = mrrData?.length > 0 ? (mrrData[mrrData.length - 1].mrr || 0) : 0;

  // Latest Churn
  const lastChurn = churnData?.length > 0 ? churnData[churnData.length - 1].churnRate : 0;

  // Calculate MRR Change
  const prevMrr = mrrData?.length > 1 ? (mrrData[mrrData.length - 2].mrr || 0) : 0;
  const mrrChange = prevMrr > 0 ? ((lastMrr - prevMrr) / prevMrr) * 100 : 0;

  // Latest ARPC
  const lastArpc = arpcData?.length > 0 ? parseFloat(arpcData[arpcData.length - 1].arpc) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your revenue metrics and business health
          </p>
        </div>
        <Select defaultValue="12m">
          <SelectTrigger className="w-full md:w-36">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="gradient" className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">MRR</p>
              <p className="text-xl md:text-2xl font-bold mt-1">₹{Math.round(lastMrr).toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium flex items-center ${mrrChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {mrrChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(mrrChange).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-primary/10">
              <IndianRupee className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card variant="gradient" className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Est. Annual Run Rate</p>
              <p className="text-xl md:text-2xl font-bold mt-1">₹{(lastMrr * 12).toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-info/10">
              <TrendingUp className="h-6 w-6 text-info" />
            </div>
          </div>
        </Card>

        <Card variant="gradient" className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">ARPC</p>
              <p className="text-xl md:text-2xl font-bold mt-1">₹{Math.round(lastArpc)}</p>
            </div>
            <div className="p-3 rounded-xl bg-success/10">
              <Users className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>

        <Card variant="gradient" className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Churn Rate
              </p>
              <p className="text-xl md:text-2xl font-bold mt-1">{lastChurn}%</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/10">
              <RefreshCw className="h-6 w-6 text-warning" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Growth */}
        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>MRR Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrData}>
                  <defs>
                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(173, 80%, 40%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(173, 80%, 40%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(222, 30%, 18%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 30%, 18%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [
                      `₹${value.toLocaleString()}`,
                      "MRR",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    stroke="hsl(173, 80%, 40%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMrr)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Churn Analysis */}
        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Churn Analysis</span>
              <div className="flex items-center gap-4 text-sm font-normal">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-muted-foreground">Churned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-muted-foreground">Recovered</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={churnData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(222, 30%, 18%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 30%, 18%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => [
                      `${value}%`,
                      name === "churnRate" ? "Churn Rate" : "Recovered",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="churnRate"
                    stroke="hsl(0, 72%, 51%)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="recovered"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Plan */}
        <Card variant="gradient">
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByPlan} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(222, 30%, 18%)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="plan"
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 30%, 18%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [
                      `₹${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(173, 80%, 40%)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ARPC Trend */}
        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Average Revenue Per Customer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={arpcData}>
                  <defs>
                    <linearGradient id="colorArpc" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(199, 89%, 48%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(199, 89%, 48%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(222, 30%, 18%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 30%, 18%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`₹${Math.round(value)}`, "ARPC"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="arpc"
                    stroke="hsl(199, 89%, 48%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorArpc)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
