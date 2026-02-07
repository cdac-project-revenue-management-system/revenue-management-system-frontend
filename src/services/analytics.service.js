import { api } from "./config";

// Direct call to Node service (running on 3001)
// We use the configured 'api' instance so that interceptors (auth token, 401/403 handling) are applied.
const ANALYTICS_API_URL = "http://localhost:3001/api/analytics";

export const analyticsService = {
    async getDashboardData(companyId) {
        // Axios allows overriding baseURL by providing a full URL
        const response = await api.get(`${ANALYTICS_API_URL}/dashboard`, {
            params: { companyId },
        });
        return response.data;
    },

    async getAnalyticsPageData(companyId) {
        const response = await api.get(`${ANALYTICS_API_URL}/page`, {
            params: { companyId },
        });
        return response.data;
    }
};
