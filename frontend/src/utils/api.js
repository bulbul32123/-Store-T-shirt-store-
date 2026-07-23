import axios from 'axios';
import { API_URL } from './config';
const api = axios.create({
    baseURL: '',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            url: error.config?.url,
        });

        if (error.response?.status === 401) {
            console.log('Authentication failed - redirecting to login');
            window.location.href = '/auth/login';
        }

        if (error.response?.status === 403) {
            console.log('Access forbidden');
        }

        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (userData) => api.post('/api/auth/register', userData),
    login: (email, password) => api.post('/api/auth/login', { email, password }),
    logout: () => api.post('/api/auth/logout'),
    getMe: () => api.get('/api/auth/me'),
    updateProfile: (userData) => api.put('/api/auth/update-profile', userData),
    forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.put(`/api/auth/reset-password?token=${token}`, { password }),
    verifyEmail: (token) => api.get(`/api/auth/verify-email?token=${token}`),
};

export const adminAPI = {
    getStats: () => api.get('/api/admin/stats'),
    getAllUsers: () => api.get('/api/admin/users'),
    getUserById: (id) => api.get(`/api/admin/users/${id}`),
    updateUserRole: (id, role) => api.put(`/api/admin/users/${id}`, { role }),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
};

export const productsAPI = {
    getAllProducts: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/api/products${queryString ? `?${queryString}` : ''}`);
    },
    getProductById: (id) => api.get(`/api/products/${id}`),
    createProduct: (productData) => api.post('/api/products', productData),
    updateProduct: (id, productData) => api.put(`/api/products/${id}`, productData),
    deleteProduct: (id) => api.delete(`/api/products/${id}`),
};

export const ordersAPI = {
    getAllOrders: () => api.get('/api/orders'),
    getOrderById: (id) => api.get(`/api/orders/${id}`),
    createOrder: (orderData) => api.post('/api/orders', orderData),
    updateOrderStatus: (id, status) => api.put(`/api/orders/${id}`, { status }),
    getUserOrders: () => api.get('/api/orders/my-orders'),
};

export const categoriesAPI = {
    getAllCategories: () => api.get('/api/categories'),
    getCategoryById: (id) => api.get(`/api/categories/${id}`),
    createCategory: (categoryData) => api.post('/api/categories', categoryData),
    updateCategory: (id, categoryData) => api.put(`/api/categories/${id}`, categoryData),
    deleteCategory: (id) => api.delete(`/api/categories/${id}`),
};

export const makeApiRequest = async (method, url, data = null, config = {}) => {
    try {
        const response = await api({
            method,
            url,
            data,
            ...config,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default api;