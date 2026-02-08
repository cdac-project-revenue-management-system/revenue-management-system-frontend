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
    FileText,
    User,
    Mail,
    AlertTriangle,
    Clock
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
        return format(date, "MMM dd, yyyy");
    } catch (e) {
        return String(dateInput || "Invalid Date");
    }
};

const statusConfig = {
    paid: { label: "Paid", variant: "success", icon: CheckCircle },
    pending: { label: "Pending", variant: "warning", icon: Clock },
    overdue: { label: "Overdue", variant: "destructive", icon: AlertTriangle },
    draft: { label: "Draft", variant: "secondary", icon: FileText },
};

export const InvoiceDetailsDialog = ({ open, onOpenChange, invoice }) => {
    if (!invoice) return null;

    const config = statusConfig[invoice.status] || statusConfig.draft;
    const StatusIcon = config.icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="flex items-center gap-2">
                                Invoice #{invoice.id}
                                <Badge variant={config.variant}>
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {config.label}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription>Details for invoice {invoice.id}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="font-semibold text-xl">
                                ₹{invoice.amount?.toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Items</p>
                            <p className="font-medium">{invoice.items} items</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2"><User className="h-4 w-4" /> Client Information</h4>
                        <div className="grid grid-cols-1 gap-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{invoice.client}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">{invoice.clientEmail}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="font-medium">Dates</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Issue Date</p>
                                    <p className="font-medium">{safeDate(invoice.issueDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Due Date</p>
                                    <p className="font-medium">{safeDate(invoice.dueDate)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
