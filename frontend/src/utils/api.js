// utils/api.js
import axios from 'axios';
import { API_URL } from './config';

// Create axios instance with default configuration
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // This ensures cookies are sent with every request
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to log requests (optional)
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

// Response interceptor to handle common errors
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

        // Handle specific error cases
        if (error.response?.status === 401) {
            // Token expired or invalid
            console.log('Authentication failed - redirecting to login');
            // You can dispatch a logout action here if needed
            window.location.href = '/auth/login';
        }

        if (error.response?.status === 403) {
            // Access forbidden
            console.log('Access forbidden');
            // You could show a toast message here
        }

        return Promise.reject(error);
    }
);

// API methods for different entities
export const authAPI = {
    // Auth endpoints
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
    // Admin endpoints
    getStats: () => api.get('/api/admin/stats'),
    getAllUsers: () => api.get('/api/admin/users'),
    getUserById: (id) => api.get(`/api/admin/users/${id}`),
    updateUserRole: (id, role) => api.put(`/api/admin/users/${id}`, { role }),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
};

export const productsAPI = {
    // Products endpoints
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
    // Orders endpoints
    getAllOrders: () => api.get('/api/orders'),
    getOrderById: (id) => api.get(`/api/orders/${id}`),
    createOrder: (orderData) => api.post('/api/orders', orderData),
    updateOrderStatus: (id, status) => api.put(`/api/orders/${id}`, { status }),
    getUserOrders: () => api.get('/api/orders/my-orders'),
};

export const categoriesAPI = {
    // Categories endpoints
    getAllCategories: () => api.get('/api/categories'),
    getCategoryById: (id) => api.get(`/api/categories/${id}`),
    createCategory: (categoryData) => api.post('/api/categories', categoryData),
    updateCategory: (id, categoryData) => api.put(`/api/categories/${id}`, categoryData),
    deleteCategory: (id) => api.delete(`/api/categories/${id}`),
};

// Generic API function for custom requests
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