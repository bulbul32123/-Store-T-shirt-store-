'use client';
import { useReviews } from '@/context/ReviewContext';
import { FiEdit3 } from 'react-icons/fi';

function StarBar({ stars, count, total, active, onClick }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 w-full group transition-all ${active ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
        >
            <span className="text-xs font-semibold text-gray-600 w-2 flex-shrink-0">{stars}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${active ? 'bg-yellow-400' : 'bg-yellow-300 group-hover:bg-yellow-400'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs text-gray-500 w-5 text-right flex-shrink-0">{count}</span>
        </button>
    );
}

const FIT_COLORS = {
    'Too Small':    'bg-amber-400',
    'True to Size': 'bg-emerald-500',
    'Too Large':    'bg-indigo-400',
};

export default function ReviewSummaryWidget() {
    const { stats, loading, filterRating, setFilterRating, setSortBy, openForm, currentUser } = useReviews();

    const handleStarClick = (star) => {
        setFilterRating(prev => (prev === star ? null : star));
    };

    if (loading && !stats) {
        return (
            <div className="space-y-5 animate-pulse">
                <div className="flex items-end gap-3">
                    <div className="h-12 w-16 bg-gray-200 rounded" />
                    <div className="h-6 w-28 bg-gray-200 rounded" />
                </div>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-gray-200 rounded" />
                            <div className="flex-1 h-2 bg-gray-200 rounded-full" />
                            <div className="h-3 w-4 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const { avgRating, totalReviews, ratingDistribution = {}, fitCounts = {} } = stats;
    const totalFit = Object.values(fitCounts).reduce((a, b) => a + b, 0);
    const dominantFit = Object.entries(fitCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-5xl font-bold text-gray-900 tracking-tight">{avgRating}</span>
                    <span className="text-sm text-gray-500">out of 5</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {[1,2,3,4,5].map(n => (
                        <svg key={n} className="w-5 h-5" viewBox="0 0 20 20">
                            <path
                                fill={n <= Math.round(avgRating) ? '#f59e0b' : '#e5e7eb'}
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
                        </svg>
                    ))}
                    <span className="text-sm text-gray-500 ml-1">
                        ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ratings</p>
                {[5,4,3,2,1].map(star => (
                    <StarBar
                        key={star}
                        stars={star}
                        count={ratingDistribution[star] || 0}
                        total={totalReviews}
                        active={filterRating === star}
                        onClick={() => handleStarClick(star)}
                    />
                ))}
                {filterRating && (
                    <button
                        onClick={() => setFilterRating(null)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-1"
                    >
                        Clear filter ✕
                    </button>
                )}
            </div>

      
            {totalFit > 0 && (
                <div className="border-t border-gray-100 pt-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Fit Feedback</p>
                    <div className="space-y-2.5">
                        {Object.entries(fitCounts).filter(([, v]) => v > 0).map(([key, value]) => {
                            const pct = ((value / totalFit) * 100).toFixed(0);
                            return (
                                <div key={key}>
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>{key}</span>
                                        <span className="font-semibold">{pct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${FIT_COLORS[key] || 'bg-gray-400'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {dominantFit && (
                        <p className="mt-3 text-xs text-gray-500 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            💡 Most customers say this runs <strong className="text-gray-700">{dominantFit}</strong>.
                        </p>
                    )}
                </div>
            )}

        
            <button
                onClick={() => openForm(null)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
                <FiEdit3 size={15} />
                Write a Review
            </button>

            {!currentUser && (
                <p className="text-xs text-center text-gray-400">You'll be asked to log in</p>
            )}
        </div>
    );
}