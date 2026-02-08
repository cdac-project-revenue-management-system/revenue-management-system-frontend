import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Building2, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { clientsService } from "@/services";
import { useToast } from "@/hooks/use-toast";

const safeDate = (dateInput) => {
    if (!dateInput) return "N/A";

    let date;
    try {
        // Handle Java LocalDateTime array format [year, month, day, hour, minute, second, nano]
        if (Array.isArray(dateInput)) {
            const [year, month, day, hour, minute, second] = dateInput;
            // JS months are 0-indexed, Java is 1-indexed
            date = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
        } else {
            date = new Date(dateInput);
        }

        if (isNaN(date.getTime())) return String(dateInput); // Fallback

        return format(date, "PPP p"); // Format: "Jan 27, 2026 12:09 AM"
    } catch (e) {
        return String(dateInput || "Invalid Date");
    }
};

const ClientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchClient = async () => {
            if (!id) return;
            try {
                const data = await clientsService.getById(id);
                if (data) {
                    setClient(data);
                } else {
                    setError(true);
                }
            } catch (error) {
                console.error("Fetch client error:", error);
                setError(true);
                toast({
                    title: "Error",
                    description: "Failed to load client details",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchClient();
    }, [id, toast]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="p-8 text-center space-y-4">
                <h2 className="text-xl font-semibold">Client not found</h2>
                <Button onClick={() => navigate("/clients")}>Back to Clients</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{client.fullName || "Unknown Client"}</h1>
                    <p className="text-muted-foreground">{client.email || "No email"}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Badge variant={client.status === "ACTIVE" || client.status === "active" ? "success" : "secondary"}>
                        {client.status || "UNKNOWN"}
                    </Badge>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <Avatar className="h-24 w-24">
                                <AvatarFallback className="text-2xl">
                                    {(client.fullName || "U").split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{client.email || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{client.phone || "No phone provided"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{client.companyName || "No company"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Joined {safeDate(client.createdAt || client.joinedAt)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats / Overview */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>Billing and Subscription summary</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                                <p className="text-2xl font-bold">₹{(client.totalSpent || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                                <p className="text-sm text-muted-foreground mb-1">Active Subscriptions</p>
                                <p className="text-2xl font-bold">{client.subscriptions?.length || (client.subscriptionCount || 0)}</p>
                            </div>
                        </div>

                        {/* Billing Info */}
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> Billing Information
                            </h3>
                            <div className="p-4 rounded-lg border border-border bg-card">
                                {client.billingInfo ? (
                                    <p className="text-sm whitespace-pre-wrap">{client.billingInfo}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No billing information added.</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ClientDetails;
