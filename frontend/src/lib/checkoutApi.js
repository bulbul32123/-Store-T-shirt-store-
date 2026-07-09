import axios from 'axios';
import { API_URL } from '@/utils/config';

export const checkoutApi = {
    createSession: async (payload) => {
        const { data } = await axios.post(`${API_URL}/api/orders/create-checkout-session`, payload);
        return data;
    },
    getBySessionId: async (sessionId) => {
        const { data } = await axios.get(`${API_URL}/api/orders/by-session/${sessionId}`);
        return data;
    },
};