'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/utils/api';
import AdminStats from '@/components/admin/dashboard/AdminStats';
import RevenueChart from '@/components/admin/dashboard/RevenueChart';
import TopProducts from '@/components/admin/dashboard/TopProducts';
import RecentOrdersCard from '@/components/admin/dashboard/RecentOrdersCard';
import LowStockCard from '@/components/admin/dashboard/LowStockCard';
import { StatsSkeleton, ChartSkeleton, ListSkeleton } from '@/components/admin/dashboard/DashboardSkeletons';
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
        }
    }, [user, authLoading, isAuthenticated, hasRole, router]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user || !hasRole('admin') || authLoading) return;
            try {
                setLoading(true);
                setError(null);
                const response = await adminAPI.getStats();
                if (response.data.success) {
                    setStats(response.data);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch stats');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch stats';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user, authLoading, hasRole]);

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-64 text-center">
                <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-[#18181B] mb-2">Error Loading Dashboard</h2>
                <p className="text-[#71717A] mb-4 max-w-md">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-[#18181B] text-white rounded-xl hover:bg-black transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#18181B] tracking-tight">Admin Dashboard</h1>
                    <p className="text-[#71717A] mt-1">Welcome back, {user?.name}!</p>
                </div>

                {loading || !stats ? (
                    <div className="space-y-6">
                        <StatsSkeleton />
                        <ChartSkeleton />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ListSkeleton />
                            <ListSkeleton />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AdminStats stats={stats} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <RevenueChart data={stats.revenueTrend} />
                            </div>
                            <TopProducts products={stats.topProducts} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <RecentOrdersCard orders={stats.recentOrders} />
                            <LowStockCard products={stats.lowStockProducts} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}