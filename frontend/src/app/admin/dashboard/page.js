'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/utils/api';
import AdminStats from '@/components/admin/AdminStats';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const { user, loading: authLoading, isAuthenticated, hasRole } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                toast.error('Please login to access admin dashboard');
                router.push('/auth/login');
                return;
            }

            if (!hasRole('admin')) {
                toast.error('Access denied. Admin privileges required.');
                router.push('/');
                return;
            }
        }
    }, [user, authLoading, isAuthenticated, hasRole, router]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user || !hasRole('admin') || authLoading) {
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log('Fetching admin stats...');

                // Use the adminAPI utility
                const response = await adminAPI.getStats();

                console.log('Stats response:', response.data);

                if (response.data.success) {
                    setStats(response.data);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch stats');
                }
            } catch (error) {
                console.error('Error fetching admin stats:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch stats';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, authLoading, hasRole]);

    const handleRetry = () => {
        setError(null);
        setLoading(true);
        // Re-trigger the effect by updating a dependency or call fetchStats directly
        window.location.reload();
    };

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="large" />
                <p className="ml-4 text-gray-600">Checking authentication...</p>
            </div>
        );
    }

    // Show loading while fetching stats
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="large" />
                <p className="ml-4 text-gray-600">Loading dashboard...</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (

            <div className="flex flex-col justify-center items-center h-64 text-center">
                <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
                <p className="text-gray-600 mb-4 max-w-md">{error}</p>
                <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
            <div className="flex min-h-screen bg-gray-100">
                <div className="flex-1 p-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
                    </div>

                    {/* Stats Component */}
                    {stats && <AdminStats stats={stats} />}

                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Orders Card */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Recent Orders
                            </h2>
                            {stats?.recentOrders?.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.recentOrders.map(order => (
                                        <div key={order._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <span className="font-medium text-gray-800">{order.user?.name || 'Unknown User'}</span>
                                                <p className="text-sm text-gray-500">{order.user?.email}</p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-green-600 font-semibold text-lg">
                                                    ${order.totalAmount?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500">No recent orders</p>
                                </div>
                            )}
                        </div>

                        {/* Low Stock Products Card */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                Low Stock Products
                            </h2>
                            {stats?.lowStockProducts?.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.lowStockProducts.map(product => (
                                        <div key={product._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <span className="font-medium text-gray-800">{product.name}</span>
                                                {product.category && (
                                                    <p className="text-sm text-gray-500">{product.category.name}</p>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${product.stockQuantity <= 5
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                {product.stockQuantity} left
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p className="text-gray-500">All products are well stocked</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
    );
}