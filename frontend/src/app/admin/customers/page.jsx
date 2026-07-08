'use client';

/**
 * frontend/src/app/admin/customers/page.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates all state: fetching, filtering, pagination, drawer open/close,
 * and customer PATCH updates. Child components are purely presentational.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import MetricsGrid    from '@/components/admin/MetricsGrid';
import FilterBar      from '@/components/admin/FilterBar';
import CustomersTable from '@/components/admin/CustomersTable';
import CustomerDrawer from '@/components/admin/CustomerDrawer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DEFAULT_METRICS = {
  totalCustomers:    0,
  activeCustomers:   0,
  averageOrderValue: 0,
  newThisMonth:      0
};

const DEFAULT_PAGINATION = {
  currentPage:  1,
  totalPages:   1,
  totalItems:   0,
  itemsPerPage: 10
};

export default function CustomersPage() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [customers,   setCustomers]   = useState([]);
  const [metrics,     setMetrics]     = useState(DEFAULT_METRICS);
  const [pagination,  setPagination]  = useState(DEFAULT_PAGINATION);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  // ── Filter / sort / page state ──────────────────────────────────────────────
  const [page,    setPage]    = useState(1);
  const [filters, setFilters] = useState({
    search:  '',
    segment: 'all',
    sort:    'createdAt_desc'
  });

  // ── Drawer state ────────────────────────────────────────────────────────────
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerOpen,       setDrawerOpen]       = useState(false);

  // ── Abort controller ref (prevents race conditions on fast filter changes) ──
  const abortRef = useRef(null);

  // ══════════════════════════════════════════════════════════════════════════
  // Core fetch — fires whenever page OR filters change
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page:  String(page),
          limit: '10',
          sort:  filters.sort
        });
        if (filters.search.trim())      params.set('search',  filters.search.trim());
        if (filters.segment !== 'all')  params.set('segment', filters.segment);

        const res = await fetch(
          `${API_BASE}/api/admin/customers?${params}`,
          { credentials: 'include', signal: abortRef.current.signal }
        );

        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const { data } = await res.json();
        setCustomers(data.customers  || []);
        setMetrics(data.metrics      || DEFAULT_METRICS);
        setPagination(data.pagination || DEFAULT_PAGINATION);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setCustomers([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();

    return () => { abortRef.current?.abort(); };
  }, [page, filters]);   // single effect — batched state updates keep this DRY

  // ══════════════════════════════════════════════════════════════════════════
  // Filter helpers — always reset to page 1
  // ══════════════════════════════════════════════════════════════════════════
  const handleFilterChange = useCallback((key, value) => {
    setPage(1);
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // Drawer helpers
  // ══════════════════════════════════════════════════════════════════════════
  const openDrawer = useCallback((customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    // Keep customer in state during close animation, then clear
    setTimeout(() => setSelectedCustomer(null), 320);
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // PATCH customer — updates both the table row and the open drawer
  // ══════════════════════════════════════════════════════════════════════════
  const handleCustomerUpdate = useCallback(async (id, updates) => {
    const res = await fetch(`${API_BASE}/api/admin/customers/${id}`, {
      method:      'PATCH',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify(updates)
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || 'Update failed');
    }

    const { data } = await res.json();
console.log('[CustomersPage] PATCH response', data);
    // Update table row — preserve computed fields (totalOrders/totalSpent)
    // that the PATCH endpoint doesn't re-aggregate
    setCustomers(prev =>
      prev.map(c =>
        c._id === id
          ? { ...c, ...data, totalOrders: c.totalOrders, totalSpent: c.totalSpent }
          : c
      )
    );

    // Sync the drawer if this customer is currently open
    if (selectedCustomer?._id === id) {
      setSelectedCustomer(prev => ({ ...prev, ...data }));
    }

    return data;
  }, [selectedCustomer]);

  // ══════════════════════════════════════════════════════════════════════════
  // Render
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Customer Management
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Monitor, segment, and manage your entire customer base
            </p>
          </div>

          {/* Optional: export button placeholder */}
          <button
            disabled
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                       bg-white border border-gray-200 text-gray-400 cursor-not-allowed"
          >
            Export CSV
          </button>
        </div>

        {/* ── Error banner ────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            ⚠ Failed to load customers: {error}
          </div>
        )}

        {/* ── KPI metric cards ────────────────────────────────────────────── */}
        <MetricsGrid metrics={metrics} loading={loading} />

        {/* ── Filter / search / sort bar ──────────────────────────────────── */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* ── Main data table ─────────────────────────────────────────────── */}
        <CustomersTable
          customers={customers}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewCustomer={openDrawer}
          onUpdateCustomer={handleCustomerUpdate}
        />

      </div>

      {/* ── Slide-out drawer ──────────────────────────────────────────────── */}
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