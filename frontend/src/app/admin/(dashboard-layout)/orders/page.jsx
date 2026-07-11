// Admin Order page
'use client';
import { useState } from 'react';
import toast from 'react-hot-toast'; // already used elsewhere in this project (RootLayout)
import { useOrders } from '@/hooks/useOrders';
import { adminOrdersApi } from '@/lib/adminOrdersApi';
import OrderMetricsCards from '@/components/OrderMetricsCards';
import OrderFiltersBar from '@/components/OrderFiltersBar';
import BulkActionsBar from '@/components/BulkActionsBar';
import OrdersTable from '@/components/OrdersTable';
import Pagination from '@/components/Pagination';
import OrderDetailDrawer from '@/components/OrderDetailDrawer';
import OrdersPageSkeleton from '@/components/admin/LoadingSkeletons/OrdersPageSkeleton';

function exportOrdersAsCsv(orders) {
    const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Total', 'Payment Status', 'Fulfillment Status'];
    const rows = orders.map((o) => [
        o.displayId,
        new Date(o.createdAt).toISOString(),
        o.customer.name,
        o.customer.email,
        o.totalPrice,
        o.paymentStatus,
        o.orderStatus
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
    const {
        orders,
        loading,
        currentPage,
        totalPages,
        totalOrders,
        summary,
        filters,
        limit,
        setCurrentPage,
        updateFilters,
        resetFilters,
        refetch
    } = useOrders();

    const [selectedIds, setSelectedIds] = useState([]);
    const [activeOrderId, setActiveOrderId] = useState(null);

    const toggleSelect = (id) =>
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const toggleSelectAll = (checked) => setSelectedIds(checked ? orders.map((o) => o.id) : []);

    const handleBulkStatusUpdate = async (orderStatus) => {
        try {
            const result = await adminOrdersApi.bulkUpdateStatus(selectedIds, orderStatus);
            toast.success(result.message || 'Orders updated');
            setSelectedIds([]);
            refetch();
        } catch (err) {
            toast.error(err.message || 'Bulk update failed');
        }
    };

    const handleBulkExport = (selectedOrders) => {
        exportOrdersAsCsv(selectedOrders);
        toast.success(`Exported ${selectedOrders.length} order(s) to CSV`);
    };
if (loading && orders.length === 0) {
    return <OrdersPageSkeleton />;
}
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-sm text-gray-500">Track, fulfill, and manage every order in one place.</p>
                </div>
            </div>

            <OrderMetricsCards summary={summary} loading={loading && orders.length === 0} />

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <OrderFiltersBar filters={filters} updateFilters={updateFilters} resetFilters={resetFilters} />

                <div className="px-4 pt-3">
                    <BulkActionsBar
                        selectedIds={selectedIds}
                        orders={orders}
                        onClear={() => setSelectedIds([])}
                        onBulkStatusUpdate={handleBulkStatusUpdate}
                        onBulkExport={handleBulkExport}
                    />
                </div>

                <OrdersTable
                    orders={orders}
                    loading={loading}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onToggleSelectAll={toggleSelectAll}
                    onOpenOrder={setActiveOrderId}
                />

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalOrders={totalOrders}
                    limit={limit}
                    onPageChange={setCurrentPage}
                />
            </div>

            <OrderDetailDrawer
                orderId={activeOrderId}
                onClose={() => setActiveOrderId(null)}
                onOrderUpdated={refetch}
            />
        </div>
    );
}
