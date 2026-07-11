// ProductReview.jsx
'use client';
import { ReviewProvider, useReviews } from '@/context/ReviewContext';
import ReviewSummaryWidget from './ReviewSummaryWidget';
import ReviewCard          from './ReviewCard';
import ReviewForm          from './ReviewForm';
import ReviewMediaModal    from './ReviewMediaModal';
import { FiRefreshCw }    from 'react-icons/fi';

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="space-y-1.5">
                    <div className="h-3 w-28 bg-gray-200 rounded" />
                    <div className="h-2.5 w-20 bg-gray-200 rounded" />
                </div>
                <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-4 w-4 bg-gray-200 rounded-sm" />)}
                </div>
            </div>
            <div className="space-y-1.5">
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-5/6  bg-gray-200 rounded" />
                <div className="h-3 w-3/4  bg-gray-200 rounded" />
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-50">
                <div className="h-7 w-16 bg-gray-200 rounded-lg" />
                <div className="h-7 w-16 bg-gray-200 rounded-lg" />
            </div>
        </div>
    );
}

// ── Sort + filter bar ─────────────────────────────────────────────────────────
function SortBar() {
    const { sortBy, setSortBy, pagination, filterRating } = useReviews();

    const sorts = [
        { value: 'newest',    label: 'Newest' },
        { value: 'oldest',    label: 'Oldest' },
        { value: 'highest',   label: 'Top Rated' },
        { value: 'lowest',    label: 'Lowest Rated' },
        { value: 'most_liked',label: 'Most Helpful' },
    ];

    return (
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <p className="text-sm text-gray-500">
                {pagination.total} review{pagination.total !== 1 ? 's' : ''}
                {filterRating && <span className="ml-1 text-indigo-600">· {filterRating}★ filter active</span>}
            </p>
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
                {sorts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
        </div>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
    const { filterRating, setFilterRating, openForm } = useReviews();
    return (
        <div className="text-center py-16">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>
            <p className="text-gray-700 font-semibold mb-1">No reviews yet</p>
            {filterRating ? (
                <>
                    <p className="text-sm text-gray-400 mb-4">No {filterRating}-star reviews found.</p>
                    <button
                        onClick={() => setFilterRating(null)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        Clear filter
                    </button>
                </>
            ) : (
                <>
                    <p className="text-sm text-gray-400 mb-4">Be the first to share your experience!</p>
                    <button
                        onClick={() => openForm(null)}
                        className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Write a Review
                    </button>
                </>
            )}
        </div>
    );
}

// ── Inner content (must be inside ReviewProvider) ─────────────────────────────
function ReviewsInner() {
    const { reviews, loading, loadingMore, pagination, loadMore } = useReviews();

    return (
        <div className="grid lg:grid-cols-3 gap-8 pt-6">
            {/* ── Left: summary widget ──────────────────────────── */}
            <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-6">
                    <ReviewSummaryWidget />
                </div>
            </div>

            {/* ── Right: review list ────────────────────────────── */}
            <div className="lg:col-span-2">
                <SortBar />

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : reviews.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <ReviewCard key={review._id} review={review} />
                            ))}
                        </div>

                        {/* Load more */}
                        {pagination.page < pagination.pages && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    {loadingMore ? (
                                        <FiRefreshCw size={14} className="animate-spin" />
                                    ) : null}
                                    {loadingMore ? 'Loading…' : `Load more (${pagination.total - reviews.length} remaining)`}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Modals (rendered at root of this subtree) ─────── */}
            <ReviewForm />
            <ReviewMediaModal />
        </div>
    );
}

// ── Public export — wraps with the provider ───────────────────────────────────
export default function ProductReviews({ product }) {
    return (
        <ReviewProvider product={product}>
            <ReviewsInner />
        </ReviewProvider>
    );
}