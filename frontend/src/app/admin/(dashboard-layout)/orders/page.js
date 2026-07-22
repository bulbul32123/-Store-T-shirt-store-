"use client";

import BulkActionsBar from "@/components/BulkActionsBar";
import OrderDetailDrawer from "@/components/OrderDetailDrawer";
import OrderFiltersBar from "@/components/OrderFiltersBar";
import OrderMetricsCards from "@/components/OrderMetricsCards";
import OrdersTable from "@/components/OrdersTable";
import Pagination from "@/components/Pagination";
import OrdersPageSkeleton from "@/components/admin/LoadingSkeletons/OrdersPageSkeleton";
import { useOrders } from "@/hooks/useOrders";
import { adminOrdersApi } from "@/lib/adminOrdersApi";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";

function exportOrdersAsCsv(orders) {
  const headers = [
    "Order ID",
    "Date",
    "Customer",
    "Email",
    "Total",
    "Payment Status",
    "Fulfillment Status",
  ];
  const rows = orders.map((o) => [
    o.displayId,
    new Date(o.createdAt).toISOString(),
    o.customer.name,
    o.customer.email,
    o.totalPrice,
    o.paymentStatus,
    o.orderStatus,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orders-export-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Inner component that accesses searchParams safely
function OrdersContent() {
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
    refetch,
  } = useOrders();

  const [selectedIds, setSelectedIds] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const highlightId = searchParams.get("highlight");
    if (highlightId) {
      setActiveOrderId(highlightId);
      router.replace("/admin/orders", { scroll: false });
    }
  }, [searchParams, router]);

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleSelectAll = (checked) =>
    setSelectedIds(checked ? orders.map((o) => o.id) : []);

  const handleBulkStatusUpdate = async (orderStatus) => {
    try {
      const result = await adminOrdersApi.bulkUpdateStatus(
        selectedIds,
        orderStatus,
      );
      toast.success(result.message || "Orders updated");
      setSelectedIds([]);
      refetch();
    } catch (err) {
      toast.error(err.message || "Bulk update failed");
    }
  };

  const handleArchiveToggle = async (orderId, archive) => {
    try {
      await adminOrdersApi.archiveOrder(orderId, archive);
      toast.success(archive ? "Order archived" : "Order restored");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update archive status");
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
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-1 text-gray-500">
            Track, fulfill, and manage every order in one place.
          </p>
        </div>
      </div>

      <OrderMetricsCards
        summary={summary}
        loading={loading && orders.length === 0}
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <OrderFiltersBar
          filters={filters}
          updateFilters={updateFilters}
          resetFilters={resetFilters}
        />

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
          onArchiveToggle={handleArchiveToggle}
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

// Default export wrapped with Suspense boundary
export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <OrdersContent />
    </Suspense>
  );
}
