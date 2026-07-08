const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include', // sends the auth cookie set by your existing /api/auth login
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message || `Request failed (${res.status})`);
    }
    return data;
}

export function buildCouponsQuery({ page, limit, filters }) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);

    if (filters.search) params.set('search', filters.search);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);

    return params.toString();
}

export const adminCouponsApi = {
    list: ({ page, limit, filters }) =>
        request(`/api/admin/coupons?${buildCouponsQuery({ page, limit, filters })}`),

    create: (body) =>
        request(`/api/admin/coupons`, { method: 'POST', body: JSON.stringify(body) }),

    toggleStatus: (id) =>
        request(`/api/admin/coupons/${id}/toggle-status`, { method: 'PATCH' }),

    remove: (id) =>
        request(`/api/admin/coupons/${id}`, { method: 'DELETE' })
};

export const adminOrdersApi = {
    list: ({ page, limit, filters }) => {
        const params = new URLSearchParams();
        params.set('page', page);
        params.set('limit', limit);
        if (filters?.search) params.set('search', filters.search);
        if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
        if (filters?.startDate) params.set('startDate', filters.startDate);
        if (filters?.endDate) params.set('endDate', filters.endDate);
        if (filters?.sortBy) params.set('sortBy', filters.sortBy);
        if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);
        return request(`/api/admin/orders?${params.toString()}`);
    },

    getById: (id) =>
        request(`/api/admin/orders/${id}`),

    updateOrder: (id, body) =>
        request(`/api/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

    bulkUpdateStatus: (ids, status) =>
        request(`/api/admin/orders/bulk-status`, { method: 'PATCH', body: JSON.stringify({ ids, status }) })
};