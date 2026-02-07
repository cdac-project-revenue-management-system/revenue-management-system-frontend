import { api } from "./config";

export const paymentService = {
    createOrder: async (amount) => {
        const response = await api.post("/payment/create-order", { amount });
        return response.data;
    },

    verifyPayment: async (paymentDetails) => {
        const response = await api.post("/payment/verify", paymentDetails);
        return response.data;
    }
};
