// ==========================================
// Payment Methods Service
// API endpoints for payment method management
// ==========================================

import api from "./config";

// Request types for creating payment methods

// export CreatePaymentMethodRequest = CreateCardRequest | CreateBankAccountRequest;

export const paymentMethodsService = {
  /**
   * Fetch all payment methods
   * GET /payment-methods
   */
  getAll: async () => {
    const response = await api.get("/payment-methods");
    return response.data;
  },

  /**
   * Create a new payment method
   * POST /payment-methods
   */
  create: async (data) => {
    const response = await api.post("/payment-methods", data);
    return response.data;
  },

  /**
   * Delete a payment method
   * DELETE /payment-methods/:id
   */
  delete: async (id) => {
    await api.delete(`/payment-methods/${id}`);
  },

  /**
   * Set a payment method as default
   * POST /payment-methods/:id/set-default
   */
  setDefault: async (id) => {
    const response = await api.post(`/payment-methods/${id}/set-default`);
    return response.data;
  },
};

export default paymentMethodsService;
