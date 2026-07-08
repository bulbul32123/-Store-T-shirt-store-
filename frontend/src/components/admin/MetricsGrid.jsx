'use client';

/**
 * frontend/src/components/admin/customers/MetricsGrid.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Four top-level KPI cards: Total Customers, Active, AOV, New This Month.
 * Shows animated skeleton while loading.
 */

import { Users, UserCheck, TrendingUp, UserPlus } from 'lucide-react';

// ── Config: one object per card ───────────────────────────────────────────────
const CARDS = [
  {
    key:     'totalCustomers',
    title:   'Total Customers',
    icon:    Users,
    format:  v => v.toLocaleString(),
    palette: {
      ring:   'ring-blue-100',
      iconBg: 'bg-blue-50',
      icon:   'text-blue-600',
      value:  'text-blue-700'
    }
  },
  {
    key:     'activeCustomers',
    title:   'Active (last 30 d)',
    icon:    UserCheck,
    format:  v => v.toLocaleString(),
    palette: {
      ring:   'ring-emerald-100',
      iconBg: 'bg-emerald-50',
      icon:   'text-emerald-600',
      value:  'text-emerald-700'
    }
  },
  {
    key:     'averageOrderValue',
    title:   'Avg. Order Value',
    icon:    TrendingUp,
    format:  v => `$${Number(v).toFixed(2)}`,
    palette: {
      ring:   'ring-violet-100',
      iconBg: 'bg-violet-50',
      icon:   'text-violet-600',
      value:  'text-violet-700'
    }
  },
  {
    key:     'newThisMonth',
    title:   'New This Month',
    icon:    UserPlus,
    format:  v => v.toLocaleString(),
    palette: {
      ring:   'ring-amber-100',
      iconBg: 'bg-amber-50',
      icon:   'text-amber-600',
      value:  'text-amber-700'
    }
  }
];

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 ring-1 ring-gray-100 p-5 flex items-center gap-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 bg-gray-100 rounded" />
        <div className="h-7 w-20 bg-gray-200 rounded" />
        <div className="h-2.5 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ── Single live card ──────────────────────────────────────────────────────────
function MetricCard({ config, value }) {
  const { title, icon: Icon, format, palette } = config;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 ring-1 ${palette.ring}
                  p-5 flex items-center gap-4 transition-shadow hover:shadow-md`}
    >
      <div className={`w-11 h-11 rounded-xl ${palette.iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-5 w-5 ${palette.icon}`} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide truncate">
          {title}
        </p>
        <p className={`text-2xl font-extrabold leading-tight mt-0.5 ${palette.value}`}>
          {format(value ?? 0)}
        </p>
      </div>
    </div>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────────
export default function MetricsGrid({ metrics, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(c => <SkeletonCard key={c.key} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(c => (
        <MetricCard key={c.key} config={c} value={metrics[c.key]} />
      ))}
    </div>
  );
}