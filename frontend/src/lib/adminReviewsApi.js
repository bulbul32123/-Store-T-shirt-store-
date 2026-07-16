const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json', ...options.headers },
        ...options
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
}

function toQS(params = {}) {
    const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    const qs = new URLSearchParams(clean).toString();
    return qs ? `?${qs}` : '';
}

export const adminReviewsApi = {
    getReviews: (params = {}) =>
        apiFetch(`/api/admin/reviews${toQS(params)}`),

    getReviewById: (id) =>
        apiFetch(`/api/admin/reviews/${id}`),

    getReportedReviews: () =>
        apiFetch('/api/admin/reviews/reports'),

    getReviewStats: () =>
        apiFetch('/api/admin/reviews/stats'),

    deleteReview: (id) =>
        apiFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' }),

    bulkUpdateStatus: (ids, action) =>
        apiFetch('/api/admin/reviews/bulk', {
            method: 'PATCH',
            body:   JSON.stringify({ ids, action })
        })
};
