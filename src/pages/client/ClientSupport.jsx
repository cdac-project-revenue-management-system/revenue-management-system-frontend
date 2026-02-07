import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Plus, 
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  FileText,
  ExternalLink,
  Send
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const tickets = [
  { id: "TKT-001", subject: "Unable to upgrade subscription", status: "in_progress", priority: "high", createdAt: "Jan 18, 2025", lastUpdate: "Jan 19, 2025" },
  { id: "TKT-002", subject: "Invoice not showing correct amount", status: "resolved", priority: "medium", createdAt: "Jan 10, 2025", lastUpdate: "Jan 12, 2025" },
  { id: "TKT-003", subject: "Question about API access", status: "closed", priority: "low", createdAt: "Dec 28, 2024", lastUpdate: "Dec 30, 2024" },
];

const faqs = [
  { question: "How do I upgrade my subscription?", answer: "Go to the Subscriptions page and click on 'Change Plan' from the menu. You can select a higher tier plan and confirm the upgrade." },
  { question: "How do I update my payment method?", answer: "Navigate to the Payments page where you can add new payment methods or set a different card as your default." },
  { question: "Can I pause my subscription?", answer: "Yes, you can pause your subscription from the Subscriptions page. Click the menu and select 'Pause Subscription'. Your access will continue until the current billing period ends." },
  { question: "How do I download invoices?", answer: "Go to the Invoices page and click the download icon next to any invoice to get a PDF copy." },
  { question: "What happens if my payment fails?", answer: "We'll automatically retry the payment after 3 days. You'll receive email notifications about the failed payment and any retry attempts." },
];

const statusConfig = {
  open: { label: "Open", variant: "warning", icon: AlertCircle },
  in_progress: { label: "In Progress", variant: "info", icon: Clock },
  resolved: { label: "Resolved", variant: "success", icon: CheckCircle },
  closed: { label: "Closed", variant: "secondary", icon: CheckCircle },
};

const priorityConfig = {
  low: { label: "Low", variant: "secondary" },
  medium: { label: "Medium", variant: "warning" },
  high: { label: "High", variant: "destructive" },
};

const ClientSupport = () => {
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground mt-1">
            Get help with your account or contact our support team
          </p>
        </div>
        <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue and our team will get back to you
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Brief description of your issue" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="billing">Billing & Payments</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Provide details about your issue..." rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewTicketOpen(false)}>Cancel</Button>
              <Button variant="gradient" onClick={() => setNewTicketOpen(false)}>
                <Send className="mr-2 h-4 w-4" />
                Submit Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Documentation</h3>
              <p className="text-sm text-muted-foreground">Browse our guides</p>
            </div>
            <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-info" />
            </div>
            <div>
              <h3 className="font-medium">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Chat with support</p>
            </div>
            <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-medium">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground">Watch & learn</p>
            </div>
            <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* My Tickets */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>My Tickets</CardTitle>
              <CardDescription>Track your support requests</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const StatusIcon = statusConfig[ticket.status].icon;
              return (
                <div key={ticket.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{ticket.subject}</p>
                        <Badge variant={priorityConfig[ticket.priority].variant} className="text-xs">
                          {priorityConfig[ticket.priority].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ticket.id} • Created {ticket.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusConfig[ticket.status].variant}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig[ticket.status].label}
                    </Badge>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSupport;
