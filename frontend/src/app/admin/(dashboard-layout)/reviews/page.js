'use client';
import ReviewDetailDrawer from '@/components/admin/reviews/ReviewDetailDrawer';
import ReviewFiltersBar from '@/components/admin/reviews/ReviewFiltersBar';
import ReviewsTable from '@/components/admin/reviews/ReviewsTable';
import { useDebounce } from '@/hooks/useDebounce';
import { adminReviewsApi } from '@/lib/adminReviewsApi';
import { getSocket } from '@/lib/socket';
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiFlag, FiLoader, FiMessageSquare, FiStar, FiTrash2, FiX } from 'react-icons/fi';

function ConfirmModal({ title, message, confirmText, variant = 'danger', onConfirm, onClose }) {
    const btnCls = variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white';
    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="fixed inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{message}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${btnCls}`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, badge, loading, color = 'indigo' }) {
    const colors = { indigo: 'bg-indigo-50 text-indigo-600', rose: 'bg-rose-50 text-rose-600', emerald: 'bg-emerald-50 text-emerald-600' };
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>{icon}</div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                {loading ? <div className="mt-1 h-6 w-16 bg-gray-100 animate-pulse rounded" /> : (
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
                        {badge != null && badge > 0 && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{badge} new</span>}
                    </div>
                )}
            </div>
        </div>
    );
}

function BulkBar({ count, loading, onDelete, onClear }) {
    return (
        <div className="flex items-center gap-3 px-5 py-3 bg-[#CAEF96] border border-[#CAEF96] rounded-xl">
            <span className="text-sm font-semibold text-black flex-shrink-0">{count} selected</span>
            {loading ? (
                <span className="flex items-center gap-1.5 text-sm text-black ml-2"><FiLoader size={14} className="animate-spin" /> Processing…</span>
            ) : (
                <button onClick={onDelete} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors">
                    <FiTrash2 size={13} /> Delete all
                </button>
            )}
            <button onClick={onClear} className="ml-auto text-indigo-400 hover:text-indigo-600 p-1 rounded transition-colors" title="Clear selection">
                <FiX size={15} />
            </button>
        </div>
    );
}

function Pagination({ page, pages, total, limit, onPageChange }) {
    if (pages <= 1) return null;
    const start = (page - 1) * limit + 1;
    const end   = Math.min(page * limit, total);
    const range = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) range.push(i);
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
            <p className="text-sm text-gray-500">Showing <span className="font-medium text-gray-700">{start}–{end}</span> of <span className="font-medium text-gray-700">{total}</span> reviews</p>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">‹ Prev</button>
                {range.map((p) => (
                    <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${p === page ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
                ))}
                <button onClick={() => onPageChange(page + 1)} disabled={page === pages} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next ›</button>
            </div>
        </div>
    );
}

const DEFAULT_FILTERS = { rating: '', search: '', dateFrom: '', dateTo: '', sort: 'newest' };

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'reported'

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 20,
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [detailReview, setDetailReview] = useState(null);
  const [modal, setModal] = useState(null);
  const [newReportsBadge, setNewReportsBadge] = useState(0);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(filters.search, 400);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const id = searchParams.get("id");
    const tabParam = searchParams.get("tab");
    if (tabParam === "reported") setActiveTab("reported");
if (id) {
  adminReviewsApi
    .getReviewById(id)
    .then((data) => setDetailReview(data.review)) // ← also see note below
    .catch((err) => toast.error(err.message || "Failed to load review"));
  router.replace("/admin/reviews", { scroll: false });
}
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await adminReviewsApi.getReviewStats();
      setStats(data);
    } catch (err) {
      console.error("Stats fetch failed:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchAllReviews = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      try {
        const isMin = filters.rating.startsWith("min");
        const params = {
          rating: isMin ? "" : filters.rating || undefined,
          ratingMin: isMin ? filters.rating.replace("min", "") : undefined,
          search: debouncedSearch || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          sort: filters.sort,
          page: pageNum,
          limit: 20,
        };
        const data = await adminReviewsApi.getReviews(params);
        setReviews(data.reviews);
        console.log(data);
        
        setPagination(data.pagination);
      } catch (err) {
        toast.error(err.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    },
    [filters, debouncedSearch],
  );

  const fetchReportedReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminReviewsApi.getReportedReviews();
      setReviews(data.reviews);
      setPagination({
        total: data.total,
        page: 1,
        pages: 1,
        limit: data.total || 1,
      });
      setNewReportsBadge(0);
    } catch (err) {
      toast.error(err.message || "Failed to load reported reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial stats load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Tab switch — reset everything and load the right dataset
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
    if (activeTab === "all") fetchAllReviews(1);
    else fetchReportedReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Filter changes only apply to the 'all' tab
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (activeTab !== "all") return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
    setSelectedIds(new Set());
    fetchAllReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.rating,
    debouncedSearch,
    filters.dateFrom,
    filters.dateTo,
    filters.sort,
  ]);

  const isPageInit = useRef(true);
  useEffect(() => {
    if (activeTab !== "all") return;
    if (isPageInit.current) {
      isPageInit.current = false;
      return;
    }
    fetchAllReviews(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Live socket badge for new reports
  useEffect(() => {
    const socket = getSocket();
    socket.connect();
    const handleReported = (payload) => {
      setNewReportsBadge((n) => n + 1);
      setStats((s) => (s ? { ...s, reportedCount: s.reportedCount || 0 } : s)); // count itself updates via next fetchStats()
      fetchStats();
      toast(
        `New report: "${payload.reportTitle}" on ${payload.productName || "a review"}`,
        { icon: "🚩" },
      );
      if (activeTab === "reported") fetchReportedReviews();
    };
    socket.on("review:reported", handleReported);
    return () => {
      socket.off("review:reported", handleReported);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const refetchCurrentTab = useCallback(() => {
    if (activeTab === "all") fetchAllReviews(page);
    else fetchReportedReviews();
  }, [activeTab, page, fetchAllReviews, fetchReportedReviews]);

  const handleDelete = useCallback(
    (review) => {
      setModal({
        title: "Delete Review",
        message:
          "This will permanently remove the review and notify the customer that it was removed for breaking the rules.",
        confirmText: "Delete",
        variant: "danger",
        onConfirm: async () => {
          setModal(null);
          const snapshot = reviews;
          setReviews((prev) => prev.filter((r) => r._id !== review._id));
          if (detailReview?._id === review._id) setDetailReview(null);

          try {
            await adminReviewsApi.deleteReview(review._id);
            setSelectedIds((s) => {
              const n = new Set(s);
              n.delete(review._id);
              return n;
            });
            fetchStats();
            toast.success("Review deleted and customer notified");
          } catch (err) {
            setReviews(snapshot);
            toast.error(err.message || "Failed to delete review");
          }
        },
      });
    },
    [reviews, detailReview, fetchStats],
  );

  const handleBulkDelete = () => {
    setModal({
      title: `Delete ${selectedIds.size} Reviews`,
      message: `Permanently remove ${selectedIds.size} review${selectedIds.size !== 1 ? "s" : ""} and notify each customer? This cannot be undone.`,
      confirmText: "Delete all",
      variant: "danger",
      onConfirm: async () => {
        setModal(null);
        const ids = [...selectedIds];
        setBulkLoading(true);
        try {
          await adminReviewsApi.bulkUpdateStatus(ids, "delete");
          setSelectedIds(new Set());
          await Promise.all([refetchCurrentTab(), fetchStats()]);
          toast.success(
            `${ids.length} review${ids.length !== 1 ? "s" : ""} deleted`,
          );
        } catch (err) {
          toast.error(err.message || "Bulk delete failed");
        } finally {
          setBulkLoading(false);
        }
      },
    });
  };

  const handleSelectAll = (checked) =>
    setSelectedIds(checked ? new Set(reviews.map((r) => r._id)) : new Set());
  const handleSelectRow = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Reviews &amp; Ratings
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Reviews publish automatically — manage reported content here
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<FiMessageSquare size={22} />}
          label="Total reviews"
          value={stats?.total}
          loading={statsLoading}
          color="indigo"
        />
        <StatCard
          icon={<FiFlag size={22} />}
          label="Reported"
          value={stats?.reportedCount}
          badge={newReportsBadge}
          loading={statsLoading}
          color="rose"
        />
        <StatCard
          icon={<FiStar size={22} />}
          label="Avg rating"
          value={
            stats?.averageRating != null ? `${stats.averageRating} ★` : null
          }
          loading={statsLoading}
          color="emerald"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1.5 w-fit">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "all" ? "bg-[#CAEF96] text-black shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("reported")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === "reported" ? "bg-[#CAEF96] text-black shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
        >
          Reported
          {newReportsBadge > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
              {newReportsBadge}
            </span>
          )}
        </button>
      </div>

      {activeTab === "all" && (
        <ReviewFiltersBar
          rating={filters.rating}
          onRatingChange={(v) => setFilter("rating", v)}
          search={filters.search}
          onSearchChange={(v) => setFilter("search", v)}
          dateFrom={filters.dateFrom}
          onDateFromChange={(v) => setFilter("dateFrom", v)}
          dateTo={filters.dateTo}
          onDateToChange={(v) => setFilter("dateTo", v)}
          sort={filters.sort}
          onSortChange={(v) => setFilter("sort", v)}
          onReset={resetFilters}
        />
      )}

      {selectedIds.size > 0 && (
        <BulkBar
          count={selectedIds.size}
          loading={bulkLoading}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      <ReviewsTable
        reviews={reviews}
        loading={loading}
        mode={activeTab}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        onDelete={handleDelete}
        onViewDetail={setDetailReview}
      />

      {activeTab === "all" && !loading && pagination.pages > 1 && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
        />
      )}

      <ReviewDetailDrawer
        review={detailReview}
        onClose={() => setDetailReview(null)}
        onDelete={handleDelete}
      />

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