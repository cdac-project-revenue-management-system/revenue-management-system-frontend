// ==========================================
// Plans Service
// API endpoints for plan management
// ==========================================

import api from "./config";

export const plansService = {
  /**
   * Fetch all plans
   * GET /plans
   */
  getAll: async (params = {}) => {
    const response = await api.get("/plans", { params });
    return response.data;
  },

  getByCompany: async (companyId) => {
    const response = await api.get("/plans", { params: { companyId } });
    return response.data;
  },

  /**
   * Fetch a single plan by ID
   * GET /plans/:id
   */
  getById: async (id) => {
    const response = await api.get(`/plans/${id}`);
    return response.data;
  },

  /**
   * Create a new plan
   * POST /plans
   */
  create: async (data) => {
    const response = await api.post("/plans", data);
    return response.data;
  },

  /**
   * Update an existing plan
   * PUT /plans/:id
   */
  update: async (id, data) => {
    const response = await api.put(`/plans/${id}`, data);
    return response.data;
  },

  /**
   * Delete a plan
   * DELETE /plans/:id
   */
  delete: async (id) => {
    await api.delete(`/plans/${id}`);
  },

  /**
   * Toggle plan status (active/inactive)
   * PATCH /plans/:id/status
   */
  toggleStatus: async (id, status) => {
    const response = await api.patch(`/plans/${id}/status`, { status });
    return response.data;
  },
};

export default plansService;
