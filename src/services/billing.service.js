// ==========================================
// Billing Service
// API endpoints for billing history and transactions
// ==========================================

import api from "./config";

export const billingService = {
  /**
   * Fetch billing history
   * GET /billing/history
   */
  getHistory: async () => {
    const response = await api.get("/billing/history");
    return response.data;
  },

  /**
   * Fetch a single transaction by ID
   * GET /billing/transactions/:id
   */
  getTransaction: async (id) => {
    const response = await api.get(`/billing/transactions/${id}`);
    return response.data;
  },

  /**
   * Request a refund for a transaction
   * POST /billing/transactions/:id/refund
   */
  requestRefund: async (id, reason) => {
    const response = await api.post(`/billing/transactions/${id}/refund`, { reason });
    return response.data;
  },

  /**
   * Download invoice/receipt for a transaction
   * GET /billing/transactions/:id/receipt
   */
  downloadReceipt: async (id) => {
    const response = await api.get(`/billing/transactions/${id}/receipt`, {
      responseType: "blob",
    });
    return response.data;
  }
};

export default billingService;
