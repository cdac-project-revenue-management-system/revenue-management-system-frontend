// ==========================================
// Subscriptions Service
// API endpoints for subscription management
// ==========================================

import api from "./config";

export const subscriptionsService = {
  /**
   * Fetch all subscriptions
   * GET /subscriptions
   */
  getAll: async (params = {}) => {
    const response = await api.get("/subscriptions", { params });
    return response.data;
  },

  /**
   * Fetch a single subscription by ID
   * GET /subscriptions/:id
   */
  getById: async (id) => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },

  /**
   * Create a new subscription
   * POST /subscriptions
   */
  create: async (data) => {
    const response = await api.post("/subscriptions", data);
    return response.data;
  },

  /**
   * Update an existing subscription
   * PUT /subscriptions/:id
   */
  update: async (id, data) => {
    const response = await api.put(`/subscriptions/${id}`, data);
    return response.data;
  },

  /**
   * Delete a subscription
   * DELETE /subscriptions/:id
   */
  delete: async (id) => {
    await api.delete(`/subscriptions/${id}`);
  },

  /**
   * Cancel a subscription
   * POST /subscriptions/:id/cancel
   */
  cancel: async (id) => {
    const response = await api.post(`/subscriptions/${id}/cancel`);
    return response.data;
  },

  /**
   * Pause a subscription
   * POST /subscriptions/:id/pause
   */
  pause: async (id) => {
    const response = await api.post(`/subscriptions/${id}/pause`);
    return response.data;
  },

  /**
   * Resume a paused subscription
   * POST /subscriptions/:id/resume
   */
  resume: async (id) => {
    const response = await api.post(`/subscriptions/${id}/resume`);
    return response.data;
  },

  /**
   * Change subscription plan
   * POST /subscriptions/:id/change-plan
   */
  changePlan: async (id, planId) => {
    const response = await api.post(`/subscriptions/${id}/change-plan`, { planId });
    return response.data;
  },

  /**
   * Renew subscription immediately
   * POST /subscriptions/:id/renew
   */
  renew: async (id) => {
    const response = await api.post(`/subscriptions/${id}/renew`);
    return response.data;
  },
};

export default subscriptionsService;
