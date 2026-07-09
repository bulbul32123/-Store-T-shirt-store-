import axios from 'axios';
import { API_URL } from '@/utils/config';

export const couponApi = {
    validate: async (code, subtotal) => {
        const { data } = await axios.post(`${API_URL}/api/coupons/validate`, { code, subtotal });
        return data;
    },
};