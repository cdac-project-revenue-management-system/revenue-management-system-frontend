import api from "./config";

export const companiesService = {
    /**
     * Fetch all companies
     * GET /companies
     */
    getAll: async () => {
        const response = await api.get("/companies");
        return response.data;
    },

    /**
     * Fetch a single company by ID
     * GET /companies/:id
     */
    getById: async (id) => {
        const response = await api.get(`/companies/${id}`);
        return response.data;
    },
};

export default companiesService;
