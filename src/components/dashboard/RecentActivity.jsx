import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CreditCard, UserPlus, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

const getIconForType = (type) => {
  switch (type) {
    case 'payment': return { icon: CreditCard, color: 'text-success', status: 'success' };
    case 'subscription': return { icon: UserPlus, color: 'text-info', status: 'info' };
    case 'upgrade': return { icon: TrendingUp, color: 'text-primary', status: 'default' };
    case 'warning': return { icon: AlertCircle, color: 'text-warning', status: 'warning' };
    case 'renewal': return { icon: CheckCircle2, color: 'text-success', status: 'success' };
    default: return { icon: CreditCard, color: 'text-muted-foreground', status: 'secondary' };
  }
};

export const RecentActivity = ({ data = [] }) => {
  return (
    <Card variant="gradient">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Activity</span>
          <Badge variant="outline" className="font-normal">
            Latest
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm">No recent activity</p>
        ) : (
          data.map((activity, index) => {
            const { icon: Icon, iconColor, status } = getIconForType(activity.type);
            return (
              <div
                key={activity.id || index}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div
                  className={`p-2 rounded-lg bg-secondary/50 ${iconColor}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{activity.title}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {activity.description}
                  </p>
                  <Badge
                    variant={status}
                    className="mt-2"
                  >
                    {activity.amount}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
