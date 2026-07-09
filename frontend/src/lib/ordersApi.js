import axios from 'axios';
import { API_URL } from '@/utils/config';

export const ordersApi = {
    create: async (payload) => {
        const { data } = await axios.post(`${API_URL}/api/orders`, payload);
        return data;
    },
    getMyOrders: async () => {
        const { data } = await axios.get(`${API_URL}/api/orders/my-orders`);
        return data;
    },
    getById: async (id) => {
        const { data } = await axios.get(`${API_URL}/api/orders/${id}`);
        return data;
    },
    cancel: async (id) => {
        const { data } = await axios.put(`${API_URL}/api/orders/${id}/cancel`);
        return data;
    },
};