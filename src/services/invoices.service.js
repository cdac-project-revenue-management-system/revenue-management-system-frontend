// ==========================================
// Invoices Service
// API endpoints for invoice management
// ==========================================

import api from "./config";

export const invoicesService = {
  /**
   * Fetch all invoices
   * GET /invoices
   */
  getAll: async (params = {}) => {
    const response = await api.get("/invoices", { params });
    return response.data;
  },

  /**
   * Fetch a single invoice by ID
   * GET /invoices/:id
   */
  getById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  /**
   * Create a new invoice
   * POST /invoices
   */
  create: async (data) => {
    const response = await api.post("/invoices", data);
    return response.data;
  },

  /**
   * Update an existing invoice
   * PUT /invoices/:id
   */
  update: async (id, data) => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },

  /**
   * Delete an invoice
   * DELETE /invoices/:id
   */
  delete: async (id) => {
    await api.delete(`/invoices/${id}`);
  },

  /**
   * Send invoice to client via email
   * POST /invoices/:id/send
   */
  send: async (id) => {
    await api.post(`/invoices/${id}/send`);
  },

  /**
   * Download invoice as PDF
   * GET /invoices/:id/download
   */
  download: async (id) => {
    const response = await api.get(`/invoices/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Pay an invoice
   * POST /invoices/:id/pay
   */
  pay: async (id) => {
    await api.post(`/invoices/${id}/pay`);
  },
};

export default invoicesService;
