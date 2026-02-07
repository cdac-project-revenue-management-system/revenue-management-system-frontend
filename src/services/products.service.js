// ==========================================
// Products Service
// API endpoints for product management
// ==========================================

import api from "./config";

export const productsService = {
  /**
   * Fetch all products
   * GET /products
   */
  getAll: async (params = {}) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  /**
   * Fetch a single product by ID
   * GET /products/:id
   */
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Create a new product
   * POST /products
   */
  create: async (data) => {
    const response = await api.post("/products", data);
    return response.data;
  },

  /**
   * Update an existing product
   * PUT /products/:id
   */
  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete a product
   * DELETE /products/:id
   */
  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },
};

export default productsService;
