import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  CheckCircle,
  CreditCard,
  Clock,
  AlertTriangle,
  Pause,
  XCircle
} from "lucide-react";
import { format } from "date-fns";

const safeDate = (dateInput) => {
  if (!dateInput) return "N/A";

  let date;
  try {
    if (Array.isArray(dateInput)) {
      const [year, month, day, hour, minute, second] = dateInput;
      date = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) return String(dateInput);
    return format(date, "PPP");
  } catch (e) {
    return String(dateInput || "Invalid Date");
  }
};

const statusConfig = {
  active: { label: "Active", variant: "success", icon: CheckCircle },
  paused: { label: "Paused", variant: "warning", icon: Pause },
  cancelled: { label: "Cancelled", variant: "secondary", icon: XCircle },
  past_due: { label: "Past Due", variant: "destructive", icon: AlertTriangle },
  trial: { label: "Trial", variant: "info", icon: Clock },
};

export const SubscriptionDetailsDialog = ({ open, onOpenChange, subscription }) => {
  if (!subscription) return null;

  const config = statusConfig[subscription.status] || statusConfig.active;
  const StatusIcon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                {subscription.name || subscription.plan || "Unknown Plan"}
                <Badge variant={config.variant}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {config.label}
                </Badge>
              </DialogTitle>
              <DialogDescription>{subscription.product || "Unknown Product"}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Subscription ID</p>
              <p className="font-mono text-sm">{subscription.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Billing Amount</p>
              <p className="font-semibold">
                ₹{subscription.amount}/{subscription.interval === "monthly" ? "mo" : "yr"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Billing Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Next Billing</p>
                  <p className="font-medium">{safeDate(subscription.nextBilling)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Started</p>
                  <p className="font-medium">{safeDate(subscription.startDate)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Included Features</h4>
            {subscription.features && subscription.features.length > 0 ? (
              <ul className="grid grid-cols-1 gap-2">
                {subscription.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No specific features listed.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
