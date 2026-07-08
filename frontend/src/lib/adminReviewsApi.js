// Mirrors the shape of lib/adminOrdersApi.js — fetch with credentials:include,
// no Bearer tokens, errors thrown as Error objects.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json', ...options.headers },
        ...options
    });

    // Parse body regardless of status so we can surface the server message
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
}

/**
 * Build a query string from an object, dropping null / undefined / '' values.
 */
function toQS(params = {}) {
    const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    const qs = new URLSearchParams(clean).toString();
    return qs ? `?${qs}` : '';
}

export const adminReviewsApi = {
    /**
     * GET /api/admin/reviews
     * Supported params: status, rating, ratingMin, product (id), search,
     *                   dateFrom, dateTo, sort, page, limit
     */
    getReviews: (params = {}) =>
        apiFetch(`/api/admin/reviews${toQS(params)}`),

    /** GET /api/admin/reviews/stats */
    getReviewStats: () =>
        apiFetch('/api/admin/reviews/stats'),

    /** PATCH /api/admin/reviews/:id/approve */
    approveReview: (id) =>
        apiFetch(`/api/admin/reviews/${id}/approve`, { method: 'PATCH' }),

    /** PATCH /api/admin/reviews/:id/reject */
    rejectReview: (id) =>
        apiFetch(`/api/admin/reviews/${id}/reject`, { method: 'PATCH' }),

    /** DELETE /api/admin/reviews/:id */
    deleteReview: (id) =>
        apiFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' }),

    /**
     * PATCH /api/admin/reviews/bulk
     * @param {string[]} ids   - array of review _id strings
     * @param {'approve'|'reject'|'delete'} action
     */
    bulkUpdateStatus: (ids, action) =>
        apiFetch('/api/admin/reviews/bulk', {
            method: 'PATCH',
            body:   JSON.stringify({ ids, action })
        })
};