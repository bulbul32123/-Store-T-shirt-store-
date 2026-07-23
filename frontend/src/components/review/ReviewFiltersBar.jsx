'use client';

import { FiSearch, FiX } from 'react-icons/fi';

const STATUS_TABS = [
    { value: 'all',      label: 'All' },
    { value: 'pending',  label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
];

const RATING_OPTIONS = [
    { value: '',    label: 'All ratings' },
    { value: '5',   label: '★ 5 only' },
    { value: '4',   label: '★ 4 only' },
    { value: '3',   label: '★ 3 only' },
    { value: '2',   label: '★ 2 only' },
    { value: '1',   label: '★ 1 only' },
    { value: 'min4', label: '★ 4 & up' },
    { value: 'min3', label: '★ 3 & up' }
];

const SORT_OPTIONS = [
    { value: 'newest',  label: 'Newest first' },
    { value: 'oldest',  label: 'Oldest first' },
    { value: 'highest', label: 'Highest rating' },
    { value: 'lowest',  label: 'Lowest rating' }
];

export default function ReviewFiltersBar({
    status,   onStatusChange,
    rating,   onRatingChange,
    search,   onSearchChange,
    dateFrom, onDateFromChange,
    dateTo,   onDateToChange,
    sort,     onSortChange,
    onReset
}) {
    const hasActiveFilters =
        status !== 'all' || rating || search || dateFrom || dateTo || sort !== 'newest';

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
            <div className="flex items-center gap-1 flex-wrap">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => onStatusChange(tab.value)}
                        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            status === tab.value
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}

                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX size={13} />
                        Reset filters
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <FiSearch
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={15}
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search customer or review text…"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {search && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <FiX size={13} />
                        </button>
                    )}
                </div>

                <select
                    value={rating}
                    onChange={(e) => onRatingChange(e.target.value)}
                    className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    {RATING_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>

                <select
                    value={sort}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>

                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
                    <input
                        type="date"
                        value={dateFrom}
                        max={dateTo || undefined}
                        onChange={(e) => onDateFromChange(e.target.value)}
                        className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
                    <input
                        type="date"
                        value={dateTo}
                        min={dateFrom || undefined}
                        onChange={(e) => onDateToChange(e.target.value)}
                        className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            </div>
        </div>
    );
}