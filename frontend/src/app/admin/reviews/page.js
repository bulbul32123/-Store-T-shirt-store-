'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { adminReviewsApi } from '@/lib/adminReviewsApi';
import { useDebounce }     from '@/hooks/useDebounce';
import ReviewsTable        from '@/components/admin/reviews/ReviewsTable';
import ReviewFiltersBar    from '@/components/admin/reviews/ReviewFiltersBar';
import ReviewDetailDrawer  from '@/components/admin/reviews/ReviewDetailDrawer';
import toast               from 'react-hot-toast';
import {
    FiMessageSquare, FiClock, FiStar, FiTrendingUp,
    FiCheck, FiX, FiTrash2, FiLoader
} from 'react-icons/fi';

// ─── Shared primitives ────────────────────────────────────────────────────────

/** Lightweight confirm modal (avoids depending on ConfirmModal's unknown prop API) */
function ConfirmModal({ title, message, confirmText, variant = 'danger', onConfirm, onClose }) {
    const btnCls =
        variant === 'danger'  ? 'bg-rose-600   hover:bg-rose-700   text-white' :
        variant === 'warning' ? 'bg-amber-500  hover:bg-amber-600  text-white' :
                                'bg-indigo-600 hover:bg-indigo-700 text-white';

    // Close on Escape
    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{message}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${btnCls}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

/** Stats card with optional badge for pending count */
function StatCard({ icon, label, value, badge, loading, color = 'indigo' }) {
    const colors = {
        indigo: 'bg-indigo-50  text-indigo-600',
        amber:  'bg-amber-50   text-amber-600',
        emerald:'bg-emerald-50 text-emerald-600',
        rose:   'bg-rose-50    text-rose-600'
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                {loading ? (
                    <div className="mt-1 h-6 w-16 bg-gray-100 animate-pulse rounded" />
                ) : (
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
                        {badge != null && badge > 0 && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                {badge} new
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/** Inline bulk-action bar */
function BulkBar({ count, loading, onApprove, onReject, onDelete, onClear }) {
    return (
        <div className="flex items-center gap-3 px-5 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
            <span className="text-sm font-semibold text-indigo-700 flex-shrink-0">
                {count} selected
            </span>

            {loading ? (
                <span className="flex items-center gap-1.5 text-sm text-indigo-600 ml-2">
                    <FiLoader size={14} className="animate-spin" /> Processing…
                </span>
            ) : (
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={onApprove}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                        <FiCheck size={13} /> Approve all
                    </button>
                    <button
                        onClick={onReject}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                        <FiX size={13} /> Reject all
                    </button>
                    <button
                        onClick={onDelete}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
                    >
                        <FiTrash2 size={13} /> Delete all
                    </button>
                </div>
            )}

            <button
                onClick={onClear}
                className="ml-auto text-indigo-400 hover:text-indigo-600 p-1 rounded transition-colors"
                title="Clear selection"
            >
                <FiX size={15} />
            </button>
        </div>
    );
}

/** Simple pagination — wraps whatever Pagination component you have, or falls
 *  back to this inline version if you prefer not to couple. */
function Pagination({ page, pages, total, limit, onPageChange }) {
    if (pages <= 1) return null;

    const start = (page - 1) * limit + 1;
    const end   = Math.min(page * limit, total);

    const range = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
        range.push(i);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
            <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{start}–{end}</span> of{' '}
                <span className="font-medium text-gray-700">{total}</span> reviews
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    ‹ Prev
                </button>

                {/* First page shortcut */}
                {range[0] > 1 && (
                    <>
                        <button onClick={() => onPageChange(1)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                            1
                        </button>
                        {range[0] > 2 && <span className="px-1 text-gray-400 text-sm">…</span>}
                    </>
                )}

                {range.map((p) => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                            p === page
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {p}
                    </button>
                ))}

                {/* Last page shortcut */}
                {range[range.length - 1] < pages && (
                    <>
                        {range[range.length - 1] < pages - 1 && (
                            <span className="px-1 text-gray-400 text-sm">…</span>
                        )}
                        <button onClick={() => onPageChange(pages)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                            {pages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === pages}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Next ›
                </button>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS = {
    status:   'all',
    rating:   '',
    search:   '',
    dateFrom: '',
    dateTo:   '',
    sort:     'newest'
};

export default function ReviewsPage() {
    // ── Data ────────────────────────────────────────────────────────────────
    const [reviews,    setReviews]    = useState([]);
    const [stats,      setStats]      = useState(null);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 20 });

    // ── UI states ────────────────────────────────────────────────────────────
    const [loading,      setLoading]      = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [selectedIds,  setSelectedIds]  = useState(new Set());
    const [bulkLoading,  setBulkLoading]  = useState(false);
    const [detailReview, setDetailReview] = useState(null);
    const [modal,        setModal]        = useState(null); // { title, message, confirmText, variant, onConfirm }

    // ── Filters ──────────────────────────────────────────────────────────────
    const [filters,  setFilters]  = useState(DEFAULT_FILTERS);
    const [page,     setPage]     = useState(1);

    // Debounce free-text so we don't fire on every keystroke
    const debouncedSearch = useDebounce(filters.search, 400);

    // ── Fetch helpers ────────────────────────────────────────────────────────

    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await adminReviewsApi.getReviewStats();
            console.log("REviews stats:", data)
                        setStats(data);
        } catch (err) {
            console.error('Stats fetch failed:', err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const fetchReviews = useCallback(async (pageNum = 1) => {
        setLoading(true);
        try {
            // Map the "min4" / "min3" rating values to the right API params
            const isMin    = filters.rating.startsWith('min');
            const ratingParam    = isMin ? ''                                        : filters.rating;
            const ratingMinParam = isMin ? filters.rating.replace('min', '')        : '';

            const params = {
                status:    filters.status !== 'all' ? filters.status : undefined,
                rating:    ratingParam    || undefined,
                ratingMin: ratingMinParam || undefined,
                search:    debouncedSearch || undefined,
                dateFrom:  filters.dateFrom || undefined,
                dateTo:    filters.dateTo   || undefined,
                sort:      filters.sort,
                page:      pageNum,
                limit:     20
            };

            const data = await adminReviewsApi.getReviews(params);
            console.log("REviews:", data)
            setReviews(data.reviews);
            setPagination(data.pagination);
        } catch (err) {
            toast.error(err.message || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [filters, debouncedSearch]);

    // ── Effects ──────────────────────────────────────────────────────────────

    // Initial stats load
    useEffect(() => { fetchStats(); }, [fetchStats]);

    // Re-fetch when filters change; reset to page 1
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; }
        setPage(1);
        setSelectedIds(new Set());
        fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.status, filters.rating, debouncedSearch, filters.dateFrom, filters.dateTo, filters.sort]);

    // Re-fetch when page changes (but not when filters change — those reset page above)
    const isPageInit = useRef(true);
    useEffect(() => {
        if (isPageInit.current) { isPageInit.current = false; return; }
        fetchReviews(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // ── Optimistic single-review actions ─────────────────────────────────────

    const handleApprove = useCallback(async (review) => {
        const snapshot = reviews;
        setReviews((prev) =>
            prev.map((r) => r._id === review._id ? { ...r, status: 'approved' } : r)
        );
        // Update drawer if it's showing this review
        setDetailReview((dr) => dr?._id === review._id ? { ...dr, status: 'approved' } : dr);

        try {
            await adminReviewsApi.approveReview(review._id);
            fetchStats();
            toast.success('Review approved');
        } catch (err) {
            setReviews(snapshot);
            setDetailReview((dr) => dr?._id === review._id ? { ...dr, status: review.status } : dr);
            toast.error(err.message || 'Failed to approve review');
        }
    }, [reviews, fetchStats]);

    const handleReject = useCallback((review) => {
        setModal({
            title:       'Reject Review',
            message:     'This review will be hidden from the storefront. The customer will not be notified.',
            confirmText: 'Reject',
            variant:     'warning',
            onConfirm:   async () => {
                setModal(null);
                const snapshot = reviews;
                setReviews((prev) =>
                    prev.map((r) => r._id === review._id ? { ...r, status: 'rejected' } : r)
                );
                setDetailReview((dr) => dr?._id === review._id ? { ...dr, status: 'rejected' } : dr);

                try {
                    await adminReviewsApi.rejectReview(review._id);
                    fetchStats();
                    toast.success('Review rejected');
                } catch (err) {
                    setReviews(snapshot);
                    setDetailReview((dr) => dr?._id === review._id ? { ...dr, status: review.status } : dr);
                    toast.error(err.message || 'Failed to reject review');
                }
            }
        });
    }, [reviews, fetchStats]);

    const handleDelete = useCallback((review) => {
        setModal({
            title:       'Delete Review',
            message:     'This will permanently remove the review. This action cannot be undone.',
            confirmText: 'Delete',
            variant:     'danger',
            onConfirm:   async () => {
                setModal(null);
                const snapshot = reviews;
                setReviews((prev) => prev.filter((r) => r._id !== review._id));
                if (detailReview?._id === review._id) setDetailReview(null);

                try {
                    await adminReviewsApi.deleteReview(review._id);
                    setSelectedIds((s) => { const n = new Set(s); n.delete(review._id); return n; });
                    fetchStats();
                    toast.success('Review deleted');
                } catch (err) {
                    setReviews(snapshot);
                    toast.error(err.message || 'Failed to delete review');
                }
            }
        });
    }, [reviews, detailReview, fetchStats]);

    // ── Bulk actions ──────────────────────────────────────────────────────────

    const executeBulk = useCallback(async (action) => {
        const ids = [...selectedIds];
        setBulkLoading(true);
        try {
            await adminReviewsApi.bulkUpdateStatus(ids, action);
            setSelectedIds(new Set());
            await Promise.all([fetchReviews(page), fetchStats()]);
            toast.success(
                `${ids.length} review${ids.length !== 1 ? 's' : ''} ${
                    action === 'delete' ? 'deleted' : action + 'd'
                }`
            );
        } catch (err) {
            toast.error(err.message || `Bulk ${action} failed`);
        } finally {
            setBulkLoading(false);
        }
    }, [selectedIds, fetchReviews, fetchStats, page]);

    const handleBulkApprove = () => executeBulk('approve');

    const handleBulkReject = () => {
        setModal({
            title:       `Reject ${selectedIds.size} Reviews`,
            message:     `${selectedIds.size} review${selectedIds.size !== 1 ? 's' : ''} will be hidden from the storefront.`,
            confirmText: 'Reject all',
            variant:     'warning',
            onConfirm:   () => { setModal(null); executeBulk('reject'); }
        });
    };

    const handleBulkDelete = () => {
        setModal({
            title:       `Delete ${selectedIds.size} Reviews`,
            message:     `Permanently remove ${selectedIds.size} review${selectedIds.size !== 1 ? 's' : ''}? This cannot be undone.`,
            confirmText: 'Delete all',
            variant:     'danger',
            onConfirm:   () => { setModal(null); executeBulk('delete'); }
        });
    };

    // ── Selection ─────────────────────────────────────────────────────────────

    const handleSelectAll = (checked) =>
        setSelectedIds(checked ? new Set(reviews.map((r) => r._id)) : new Set());

    const handleSelectRow = (id) =>
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    // ── Filter helpers ────────────────────────────────────────────────────────

    const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
    const resetFilters = () => { setFilters(DEFAULT_FILTERS); setPage(1); };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="p-4 md:p-6 space-y-5 max-w-screen-2xl mx-auto">

            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reviews &amp; Ratings</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Moderate customer reviews before they appear on the storefront
                </p>
            </div>

            {/* ── Stats cards ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    icon={<FiMessageSquare size={22} />}
                    label="Total reviews"
                    value={stats?.total}
                    loading={statsLoading}
                    color="indigo"
                />
                <StatCard
                    icon={<FiClock size={22} />}
                    label="Pending review"
                    value={stats?.pending}
                    badge={stats?.pending}
                    loading={statsLoading}
                    color="amber"
                />
                <StatCard
                    icon={<FiStar size={22} />}
                    label="Avg approved rating"
                    value={stats?.averageRating != null ? `${stats.averageRating} ★` : null}
                    loading={statsLoading}
                    color="emerald"
                />
                <StatCard
                    icon={<FiTrendingUp size={22} />}
                    label="Approval rate"
                    value={stats?.approvalRate != null ? `${stats.approvalRate}%` : null}
                    loading={statsLoading}
                    color="rose"
                />
            </div>

            {/* ── Filters ──────────────────────────────────────────────────── */}
            <ReviewFiltersBar
                status={filters.status}     onStatusChange={(v) => setFilter('status', v)}
                rating={filters.rating}     onRatingChange={(v) => setFilter('rating', v)}
                search={filters.search}     onSearchChange={(v) => setFilter('search', v)}
                dateFrom={filters.dateFrom} onDateFromChange={(v) => setFilter('dateFrom', v)}
                dateTo={filters.dateTo}     onDateToChange={(v) => setFilter('dateTo', v)}
                sort={filters.sort}         onSortChange={(v) => setFilter('sort', v)}
                onReset={resetFilters}
            />

            {/* ── Bulk action bar (visible only when rows are selected) ────── */}
            {selectedIds.size > 0 && (
                <BulkBar
                    count={selectedIds.size}
                    loading={bulkLoading}
                    onApprove={handleBulkApprove}
                    onReject={handleBulkReject}
                    onDelete={handleBulkDelete}
                    onClear={() => setSelectedIds(new Set())}
                />
            )}

            {/* ── Table ────────────────────────────────────────────────────── */}
            <ReviewsTable
                reviews={reviews}
                loading={loading}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectRow={handleSelectRow}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                onViewDetail={setDetailReview}
            />

            {/* ── Pagination ───────────────────────────────────────────────── */}
            {!loading && pagination.pages > 1 && (
                <Pagination
                    page={pagination.page}
                    pages={pagination.pages}
                    total={pagination.total}
                    limit={pagination.limit}
                    onPageChange={setPage}
                />
            )}

            {/* ── Detail drawer ─────────────────────────────────────────────── */}
            <ReviewDetailDrawer
                review={detailReview}
                onClose={() => setDetailReview(null)}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
            />

            {/* ── Confirm modal ─────────────────────────────────────────────── */}
            {modal && (
                <ConfirmModal
                    title={modal.title}
                    message={modal.message}
                    confirmText={modal.confirmText}
                    variant={modal.variant}
                    onConfirm={modal.onConfirm}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}