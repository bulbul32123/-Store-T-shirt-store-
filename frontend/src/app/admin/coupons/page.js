'use client';

import { useEffect, useState, useCallback } from 'react';
import CouponsTable from '@/components/admin/coupons/CouponsTable';
import CouponFormModal from '@/components/admin/coupons/CouponFormModal';
import { adminCouponsApi } from '@/lib/adminOrdersApi';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const loadCoupons = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await adminCouponsApi.list({
                page: 1,
                limit: 20,
                filters: { search, status: statusFilter }
            });
            setCoupons(res.data || []);
        } catch (err) {
            setError(err.message || 'Failed to load coupons');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        loadCoupons();
    }, [loadCoupons]);

    const handleCreate = async (payload) => {
        const res = await adminCouponsApi.create(payload);
        setCoupons((prev) => [res.data, ...prev]);
    };

    const handleToggleStatus = async (coupon) => {
        setTogglingId(coupon._id);
        try {
            const res = await adminCouponsApi.toggleStatus(coupon._id);
            setCoupons((prev) => prev.map((c) => (c._id === coupon._id ? res.data : c)));
        } catch (err) {
            setError(err.message || 'Failed to update coupon status');
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (coupon) => {
        if (!window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
        setDeletingId(coupon._id);
        try {
            await adminCouponsApi.remove(coupon._id);
            setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
        } catch (err) {
            setError(err.message || 'Failed to delete coupon');
        } finally {
            setDeletingId(null);
        }
    };

    return (
            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Coupons & Discounts</h1>
                        <p className="mt-1 text-sm text-gray-500">Create and manage discount codes for your store.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                        + Create Coupon
                    </button>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by coupon code…"
                        className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full max-w-[160px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>

                {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

                <div className="mt-6">
                    {loading ? (
                        <div className="flex justify-center py-16 text-sm text-gray-400">Loading coupons…</div>
                    ) : (
                        <CouponsTable
                            coupons={coupons}
                            onToggleStatus={handleToggleStatus}
                            onDelete={handleDelete}
                            togglingId={togglingId}
                            deletingId={deletingId}
                        />
                    )}
                </div>

                <CouponFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreate} />
            </div>
    );
}