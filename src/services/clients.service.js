// ==========================================
// Clients Service
// API endpoints for client management
// ==========================================

import api from "./config";

export const clientsService = {
  /**
   * Fetch all clients
   * GET /clients
   */
  getAll: async (params = {}) => {
    const response = await api.get("/clients", { params });
    return response.data;
  },

  /**
   * Fetch a single client by ID
   * GET /clients/:id
   */
  getById: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  /**
   * Create a new client
   * POST /clients
   */
  create: async (data) => {
    const response = await api.post("/clients", data);
    return response.data;
  },

  /**
   * Update an existing client
   * PUT /clients/:id
   */
  update: async (id, data) => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  /**
   * Delete a client
   * DELETE /clients/:id
   */
  delete: async (id) => {
    await api.delete(`/clients/${id}`);
  },

  /**
   * Suspend a client
   * PUT /clients/:id/suspend
   */
  suspend: async (id) => {
    await api.put(`/clients/${id}/suspend`);
  },
};

export default clientsService;
