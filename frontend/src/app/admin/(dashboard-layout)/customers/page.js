// customer admin page
"use client";
import CustomerDrawer from "@/components/admin/CustomerDrawer";
import CustomersTable from "@/components/admin/CustomersTable";
import FilterBar from "@/components/admin/FilterBar";
import MetricsGrid from "@/components/admin/MetricsGrid";
import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DEFAULT_METRICS = {
  totalCustomers: 0,
  activeCustomers: 0,
  averageOrderValue: 0,
  newThisMonth: 0,
};

const DEFAULT_PAGINATION = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
};

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    segment: "all",
    sort: "createdAt_desc",
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const abortRef = useRef(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          sort: filters.sort,
        });
        if (filters.search.trim()) params.set("search", filters.search.trim());
        if (filters.segment !== "all") params.set("segment", filters.segment);

        const res = await fetch(`${API_BASE}/api/admin/customers?${params}`, {
          credentials: "include",
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const { data } = await res.json();
        setCustomers(data.customers || []);
        setMetrics(data.metrics || DEFAULT_METRICS);
        setPagination(data.pagination || DEFAULT_PAGINATION);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setCustomers([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();

    return () => {
      abortRef.current?.abort();
    };
  }, [page, filters]);
  const handleFilterChange = useCallback((key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openDrawer = useCallback((customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedCustomer(null), 320);
  }, []);

  const handleCustomerUpdate = useCallback(
    async (id, updates) => {
      const res = await fetch(`${API_BASE}/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Update failed");
      }

      const { data } = await res.json();
      setCustomers((prev) =>
        prev.map((c) =>
          c._id === id
            ? {
                ...c,
                ...data,
                totalOrders: c.totalOrders,
                totalSpent: c.totalSpent,
              }
            : c,
        ),
      );

      if (selectedCustomer?._id === id) {
        setSelectedCustomer((prev) => ({ ...prev, ...data }));
      }

      return data;
    },
    [selectedCustomer],
  );
  const handleExportCSV = useCallback(async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ sort: filters.sort });
      if (filters.search.trim()) params.set("search", filters.search.trim());
      if (filters.segment !== "all") params.set("segment", filters.segment);
      params.set("limit", "10000");
      params.set("page", "1");

      const res = await fetch(`${API_BASE}/api/admin/customers?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Export failed");
      const { data } = await res.json();

      const rows = data.customers.map((c) => ({
        Name: c.name,
        Email: c.email,
        Phone: c.phoneNumber || "",
        Status: c.status,
        Segment: c.segment,
        TotalOrders: c.totalOrders,
        TotalSpent: c.totalSpent,
        JoinedAt: c.createdAt,
      }));

      const headers = Object.keys(rows[0] || {});
      const csv = [
        headers.join(","),
        ...rows.map((r) =>
          headers
            .map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  }, [filters]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Customer Management
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Monitor, segment, and manage your entire customer base
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={exporting || customers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                       bg-white border border-gray-200 text-gray-700 hover:bg-gray-50
                       disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            ⚠ Failed to load customers: {error}
          </div>
        )}
        <MetricsGrid metrics={metrics} loading={loading} />
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
        />
        <CustomersTable
          customers={customers}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewCustomer={openDrawer}
          onUpdateCustomer={handleCustomerUpdate}
        />
      </div>

      <CustomerDrawer
        customer={selectedCustomer}
        open={drawerOpen}
        onClose={closeDrawer}
        onUpdate={handleCustomerUpdate}
        apiBase={API_BASE}
      />
    </div>
  );
}
