import axios from 'axios';
import { API_URL } from '@/utils/config';

export const rewardsApi = {
    getMine: async () => {
        const { data } = await axios.get(`${API_URL}/api/coupons/my-rewards`);
        return data;
    },
};