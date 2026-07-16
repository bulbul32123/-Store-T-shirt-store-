'use client';
import { useCallback, useEffect, useState } from 'react';
import { adminOrdersApi } from '@/lib/adminOrdersApi';

const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  startDate: "",
  endDate: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  archived: false, 
};
const DEFAULT_SUMMARY = {
    totalOrders: 0,
    pendingFulfillment: 0,
    totalRevenue: 0,
    refundedOrCancelled: 0
};

export function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [summary, setSummary] = useState(DEFAULT_SUMMARY);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const limit = 10;

    const fetchOrders = useCallback(async (page, activeFilters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminOrdersApi.list({ page, limit, filters: activeFilters });
            setOrders(data.orders);
            setCurrentPage(data.pagination.currentPage);
            setTotalPages(data.pagination.totalPages);
            setTotalOrders(data.pagination.totalOrders);
            setSummary(data.summary);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders(currentPage, filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, filters]);

    const updateFilters = (patch) => {
        setFilters((prev) => ({ ...prev, ...patch }));
        setCurrentPage(1); 
    };

    const resetFilters = () => {
        setFilters(DEFAULT_FILTERS);
        setCurrentPage(1);
    };

    const refetch = () => fetchOrders(currentPage, filters);

    return {
        orders,
        loading,
        error,
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
    };
}
