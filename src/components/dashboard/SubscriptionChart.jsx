import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = [
  "hsl(142, 76%, 36%)", // green
  "hsl(199, 89%, 48%)", // blue
  "hsl(0, 72%, 51%)", // red
  "hsl(38, 92%, 50%)" // yellow
];

export const SubscriptionChart = ({ data = [] }) => {
  return (
    <Card variant="gradient">
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 47%, 10%)",
                  border: "1px solid hsl(222, 30%, 18%)",
                  borderRadius: "8px",
                }}
                formatter={(value, name) => [
                  `${value} subscriptions`,
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: "hsl(215, 20%, 55%)" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
