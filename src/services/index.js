// ==========================================
// API Services - Main Export
// Import individual services from this file
// ==========================================

// Base API configuration
export { api } from "./config";

// Service modules
export { productsService } from "./products.service";
export { clientsService } from "./clients.service";
export { invoicesService } from "./invoices.service";
export { subscriptionsService } from "./subscriptions.service";
export { default as plansService } from "./plans.service";
export { default as billingService } from "./billing.service";
export { default as companiesService } from "./companies.service";
export { default as paymentMethodsService } from "./payment-methods.service";
export { paymentService } from "./payment.service";

// Types
// export type { CreateCardRequest, CreateBankAccountRequest, CreatePaymentMethodRequest } from "./payment-methods.service";
// export type { BillingHistory } from "./billing.service";
