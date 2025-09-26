'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { API_URL } from '@/utils/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Configure axios defaults for cookie-based authentication
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    // Configure axios interceptor for handling responses
    useEffect(() => {
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid, clear user state
                    setUser(null);
                    if (window.location.pathname !== '/auth/login') {
                        toast.error('Session expired. Please login again.');
                        router.push('/auth/login');
                    }
                }
                return Promise.reject(error);
            }
        );

        // Cleanup interceptor on unmount
        return () => axios.interceptors.response.eject(responseInterceptor);
    }, [router]);

    // Check if user is logged in on initial load
    useEffect(() => {
        const checkUserLoggedIn = async () => {
            try {
                setLoading(true);

                // Try to get current user using cookies
                const { data } = await axios.get(`${API_URL}/api/auth/me`);

                if (data.success && data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.log('No active session found');
                setUser(null);

                // Only show error if it's not a simple 401 (no token)
                if (error.response?.status !== 401) {
                    console.error('Auth check error:', error.response?.data?.message || error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        checkUserLoggedIn();
    }, []);

    // Register user
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            console.log('Registering user:', userData);

            const { data } = await axios.post(`${API_URL}/api/auth/register`, userData);

            if (data.success) {
                toast.success(data.message || 'Registration successful! Please check your email to verify your account.');
                router.push('/auth/login');
                return data;
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            console.log('Attempting login with email:', email);

            const { data } = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password
            });

            console.log('Login response:', data);

            if (data.success && data.user) {
                setUser(data.user);
                toast.success(data.message || 'Login successful!');

                // Redirect to dashboard or intended page
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/';
                sessionStorage.removeItem('redirectAfterLogin');
                router.push(redirectUrl);

                return data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    const adminLogin = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            console.log('Attempting login with email:', email);

            const { data } = await axios.post(`${API_URL}/api/admin/login`, {
                email,
                password
            });

            console.log('Login response:', data);

            if (data.success && data.user) {
                setUser(data.user);
                toast.success(data.message || 'Login successful!');

                // Redirect to dashboard or intended page
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/admin/dashboard';
                sessionStorage.removeItem('redirectAfterLogin');
                router.push(redirectUrl);

                return data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logout = async () => {
        try {
            // Call logout endpoint to clear the cookie
            await axios.post(`${API_URL}/api/auth/logout`);

            setUser(null);
            toast.success('Logged out successfully');
            router.push('/');
        } catch (error) {
            // Even if the request fails, clear the user state
            console.error('Logout error:', error);
            setUser(null);
            toast.success('Logged out successfully');
            router.push('/');
        }
    };

    // Update user profile
    const updateProfile = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            console.log('Updating profile with:', userData);

            const { data } = await axios.put(`${API_URL}/api/auth/update-profile`, userData);

            if (data.success && data.user) {
                setUser(data.user);
                toast.success(data.message || 'Profile updated successfully');
                return data;
            } else {
                throw new Error(data.message || 'Profile update failed');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Update failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Forgot password
    const forgotPassword = async (email) => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });

            if (data.success) {
                toast.success(data.message || 'Password reset email sent. Please check your inbox.');
                return data;
            } else {
                throw new Error(data.message || 'Failed to send reset email');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
            setError(errorMessage);
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Reset password
    const resetPassword = async (token, password) => {
        try {
            setLoading(true);
            setError(null);

            // Note: Updated to match your backend route structure
            const { data } = await axios.put(`${API_URL}/api/auth/reset-password?token=${token}`, {
                password
            });

            if (data.success) {
                toast.success(data.message || 'Password reset successful. You can now login with your new password.');
                router.push('/auth/login');
                return data;
            } else {
                throw new Error(data.message || 'Password reset failed');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Verify email
    const verifyEmail = async (token) => {
        try {
            setLoading(true);
            setError(null);

            // Note: Updated to match your backend route structure
            const { data } = await axios.get(`${API_URL}/api/auth/verify-email?token=${token}`);

            if (data.success) {
                toast.success(data.message || 'Email verified successfully. You can now login.');
                return data;
            } else {
                throw new Error(data.message || 'Email verification failed');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Email verification failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Refresh user data
    const refreshUser = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/auth/me`);
            if (data.success && data.user) {
                setUser(data.user);
                return data.user;
            }
            return null;
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            return null;
        }
    };

    // Check if user is authenticated
    const isAuthenticated = !!user;

    // Check if user has specific role
    const hasRole = (role) => {
        return user?.role === role;
    };

    // Check if user is verified
    const isVerified = () => {
        return user?.isVerified === true;
    };

    const value = {
        // State
        user,
        loading,
        error,
        isAuthenticated,

        // Actions
        register,
        login,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        verifyEmail,
        refreshUser,

        hasRole,
        isVerified,

        // Clear error function
        clearError: () => setError(null)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};