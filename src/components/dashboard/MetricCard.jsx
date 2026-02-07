import { Card } from "../ui/card";
import { cn } from "../../lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export const MetricCard = ({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon,
  iconColor = "text-primary",
  className,
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const isNeutral = !change || change === 0;

  return (
    <Card
      variant="gradient"
      className={cn(
        "p-6 hover:shadow-elevated transition-all duration-300 group",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight">{value}</p>
          {change != null && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  isPositive && "text-success",
                  isNegative && "text-destructive",
                  isNeutral && "text-muted-foreground"
                )}
              >
                {isPositive && <TrendingUp className="h-4 w-4" />}
                {isNegative && <TrendingDown className="h-4 w-4" />}
                {isNeutral && <Minus className="h-4 w-4" />}
                {isPositive && "+"}
                {change}%
              </span>
              <span className="text-xs text-muted-foreground">
                {changeLabel}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-xl bg-secondary/50 group-hover:scale-110 transition-transform duration-300",
            iconColor
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
