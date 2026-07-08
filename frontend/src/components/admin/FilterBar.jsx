'use client';

/**
 * frontend/src/components/admin/customers/FilterBar.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * • Debounced search (300 ms) — calls onFilterChange('search', val) after delay
 * • Segment quick-filter pills
 * • Sort dropdown
 *
 * Props:
 *   filters         { search, segment, sort }
 *   onFilterChange  (key, value) => void
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const SEGMENTS = [
  { value: 'all',          label: 'All Customers' },
  { value: 'repeat_buyer', label: 'Repeat Buyers'  },
  { value: 'high_spender', label: 'High Spenders'  },
  { value: 'inactive',     label: 'Inactive'        }
];

const SORT_OPTIONS = [
  { value: 'createdAt_desc',   label: 'Newest Joined'   },
  { value: 'totalSpent_desc',  label: 'Highest Spent'   },
  { value: 'totalOrders_desc', label: 'Most Orders'     },
  { value: 'name_asc',         label: 'Name A → Z'     }
];

export default function FilterBar({ filters, onFilterChange }) {
  // Local input value so typing feels instant
  const [inputValue, setInputValue] = useState(filters.search);
  const debounceRef  = useRef(null);
  const isFirstMount = useRef(true);

  // Sync if parent resets search externally
  useEffect(() => {
    if (filters.search === '') setInputValue('');
  }, [filters.search]);

  // Debounced emit to parent
  useEffect(() => {
    // Skip emitting on first mount (value already in parent state)
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange('search', inputValue);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [inputValue]);   // eslint-disable-line react-hooks/exhaustive-deps

  const clearSearch = useCallback(() => {
    setInputValue('');
    onFilterChange('search', '');
  }, [onFilterChange]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">

      {/* ── Row 1: search + sort ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="w-full h-9 pl-9 pr-8 text-sm border border-gray-200 rounded-lg
                       bg-gray-50 placeholder-gray-400 text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                       transition-all"
          />
          {inputValue && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative flex-shrink-0">
          <SlidersHorizontal
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
          />
          <select
            value={filters.sort}
            onChange={e => onFilterChange('sort', e.target.value)}
            className="h-9 pl-9 pr-8 text-sm border border-gray-200 rounded-lg
                       bg-gray-50 text-gray-700 appearance-none cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                       transition-all"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {/* Custom chevron */}
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▾</span>
        </div>
      </div>

      {/* ── Row 2: segment pills ─────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Customer segment filter">
        {SEGMENTS.map(seg => (
          <button
            key={seg.value}
            onClick={() => onFilterChange('segment', seg.value)}
            className={`h-7 px-3.5 text-xs font-semibold rounded-full border transition-all duration-150 ${
              filters.segment === seg.value
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
            aria-pressed={filters.segment === seg.value}
          >
            {seg.label}
          </button>
        ))}
      </div>
    </div>
  );
}