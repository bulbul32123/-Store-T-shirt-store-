'use client';

import { useEffect } from 'react';
import { FiX, FiExternalLink, FiShield, FiImage, FiVideo } from 'react-icons/fi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function StarRating({ value }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <svg key={n} width={18} height={18} viewBox="0 0 24 24">
                    <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                        fill={n <= value ? '#f59e0b' : '#e5e7eb'}
                        stroke={n <= value ? '#d97706' : '#d1d5db'}
                        strokeWidth="0.5"
                    />
                </svg>
            ))}
            <span className="text-sm font-semibold text-gray-700 ml-1">{value} / 5</span>
        </div>
    );
}

const STATUS_STYLES = {
    pending:  'bg-amber-100   text-amber-700  ring-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    rejected: 'bg-rose-100    text-rose-700   ring-rose-200'
};

function productThumb(product) {
    if (!product?.images?.length) return null;
    const first = product.images[0];
    return typeof first === 'string' ? first : first?.url || null;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ReviewDetailDrawer({
    review,
    onClose,
    onApprove,
    onReject,
    onDelete
}) {
    const open = Boolean(review);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    // Prevent body scroll while drawer is open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!review) return null;

    const thumb = productThumb(review.product);
    const date  = new Date(review.createdAt).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const initials = review.user?.name?.[0]?.toUpperCase() || '?';

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-lg bg-white shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Review Detail</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{date}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* ── Status badge ──────────────────────────────────── */}
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ring-1 capitalize ${STATUS_STYLES[review.status] || 'bg-gray-100 text-gray-700 ring-gray-200'}`}>
                            {review.status}
                        </span>
                        {review.order && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                                <FiShield size={13} />
                                Verified Purchase
                            </span>
                        )}
                    </div>

                    {/* ── Product ───────────────────────────────────────── */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Product</h3>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            {thumb ? (
                                <img src={thumb} alt={review.product?.name} className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                                <div className="h-14 w-14 rounded-lg bg-gray-200 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                    {review.product?.name || 'Unknown product'}
                                </p>
                                {review.product?.slug && (
                                    <a
                                        href={`/product/${review.product._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 mt-0.5"
                                    >
                                        View on store <FiExternalLink size={11} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ── Customer ──────────────────────────────────────── */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Customer</h3>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                {review.user?.avatar ? (
                                    <img src={review.user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                    <span className="text-sm font-semibold text-indigo-700">{initials}</span>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{review.user?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{review.user?.email || ''}</p>
                            </div>
                        </div>
                    </section>

                    {/* ── Rating ────────────────────────────────────────── */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Rating</h3>
                        <StarRating value={review.rating} />
                    </section>

                    {/* ── Review text ───────────────────────────────────── */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Review</h3>
                        <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">
                            {review.reviewText}
                        </p>
                    </section>

                    {/* ── Images ────────────────────────────────────────── */}
                    {review.images?.length > 0 && (
                        <section>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <FiImage size={13} /> Photos ({review.images.length})
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {review.images.map((img, i) => (
                                    <a key={i} href={img.url} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={img.url}
                                            alt={`Review image ${i + 1}`}
                                            className="h-24 w-full object-cover rounded-lg border border-gray-100 hover:opacity-90 transition-opacity"
                                        />
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Video ─────────────────────────────────────────── */}
                    {review.video?.url && (
                        <section>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <FiVideo size={13} /> Video
                            </h3>
                            <video
                                src={review.video.url}
                                controls
                                className="w-full rounded-xl border border-gray-100 max-h-52 object-cover"
                            />
                        </section>
                    )}

                    {/* ── Moderation meta ───────────────────────────────── */}
                    {review.moderatedBy && (
                        <section>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Moderated by</h3>
                            <p className="text-sm text-gray-600">
                                {review.moderatedBy?.name || 'Admin'}
                                {review.moderatedAt && (
                                    <span className="text-gray-400 ml-1">
                                        · {new Date(review.moderatedAt).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </span>
                                )}
                            </p>
                        </section>
                    )}
                </div>

                {/* ── Action footer ────────────────────────────────────── */}
                <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        {review.status !== 'approved' && (
                            <button
                                onClick={() => { onApprove(review); onClose(); }}
                                className="flex-1 min-w-[100px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                                Approve
                            </button>
                        )}
                        {review.status !== 'rejected' && (
                            <button
                                onClick={() => { onClose(); onReject(review); }}
                                className="flex-1 min-w-[100px] px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                                Reject
                            </button>
                        )}
                        <button
                            onClick={() => { onClose(); onDelete(review); }}
                            className="flex-1 min-w-[100px] px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}