'use client';

/**
 * frontend/src/components/admin/customers/CustomersTable.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Columns: Customer Info | Status | Orders | LTV | Location | Joined | Actions
 *
 * Props:
 *   customers        []
 *   loading          bool
 *   pagination       { currentPage, totalPages, totalItems, itemsPerPage }
 *   onPageChange     (page) => void
 *   onViewCustomer   (customer) => void
 *   onUpdateCustomer (id, updates) => Promise
 */

import { useState, useRef, useEffect } from 'react';
import {
  MoreHorizontal, Eye, Edit2, Ban, CheckCircle2,
  ChevronLeft, ChevronRight, Users, AlertTriangle
} from 'lucide-react';

// ── Utility helpers ────────────────────────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500',
  'bg-amber-500',  'bg-cyan-500',   'bg-pink-500',    'bg-teal-500'
];
function avatarColor(name = '') {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  });
}

function fmtMoney(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);
}

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive:  'bg-amber-50   text-amber-700   border-amber-200',
  suspended: 'bg-red-50     text-red-700     border-red-200'
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                      border capitalize ${STATUS_STYLES[status] || STATUS_STYLES.inactive}`}>
      {status}
    </span>
  );
}

// ── Segment badge ─────────────────────────────────────────────────────────────
const SEGMENT_STYLES = {
  regular:      'bg-gray-100   text-gray-600',
  repeat_buyer: 'bg-blue-50    text-blue-700',
  high_spender: 'bg-purple-50  text-purple-700',
  inactive:     'bg-orange-50  text-orange-700'
};
const SEGMENT_LABELS = {
  regular:      'Regular',
  repeat_buyer: 'Repeat',
  high_spender: 'VIP',
  inactive:     'Lapsed'
};

function SegmentPip({ segment }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0 rounded text-[10px] font-bold
                      ${SEGMENT_STYLES[segment] || SEGMENT_STYLES.regular}`}>
      {SEGMENT_LABELS[segment] || segment}
    </span>
  );
}

// ── Actions dropdown ──────────────────────────────────────────────────────────
function ActionMenu({ customer, onView, onUpdateCustomer }) {
  const [open,     setOpen]     = useState(false);
  const [working,  setWorking]  = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSuspendToggle = async () => {
    setOpen(false);
    setWorking(true);
    try {
      const newStatus = customer.status === 'suspended' ? 'active' : 'suspended';
      await onUpdateCustomer(customer._id, { status: newStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={working}
        className={`p-1.5 rounded-lg transition-colors
                    ${working ? 'opacity-40 cursor-wait' : 'hover:bg-gray-100'}`}
        aria-label="Customer actions"
      >
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-48 bg-white border border-gray-200
                     rounded-xl shadow-xl z-30 py-1.5 overflow-hidden"
        >
          <MenuItem icon={Eye} label="View Profile" onClick={() => { onView(customer); setOpen(false); }} />
          <MenuItem icon={Edit2} label="Edit Details" onClick={() => { onView(customer); setOpen(false); }} />

          <div className="border-t border-gray-100 my-1" />

          {customer.status !== 'suspended' ? (
            <MenuItem
              icon={Ban}
              label="Suspend Account"
              onClick={handleSuspendToggle}
              danger
            />
          ) : (
            <MenuItem
              icon={CheckCircle2}
              label="Reactivate Account"
              onClick={handleSuspendToggle}
              positive
            />
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger, positive }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors
        ${danger   ? 'text-red-600 hover:bg-red-50'
        : positive ? 'text-emerald-600 hover:bg-emerald-50'
        :            'text-gray-700 hover:bg-gray-50'}`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </button>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      {/* Customer info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-28 bg-gray-200 rounded" />
            <div className="h-2.5 w-36 bg-gray-100 rounded" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
      <td className="px-4 py-3 text-center"><div className="h-3 w-6 bg-gray-200 rounded mx-auto" /></td>
      <td className="px-4 py-3 text-right"><div className="h-3 w-16 bg-gray-200 rounded ml-auto" /></td>
      <td className="px-4 py-3"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3 text-center"><div className="h-6 w-6 bg-gray-100 rounded-lg mx-auto" /></td>
    </tr>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
function Pagination({ pagination, onPageChange }) {
  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;

  if (totalItems === 0) return null;

  const from = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const to   = Math.min(currentPage * itemsPerPage, totalItems);

  // Build visible page numbers with ellipsis
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages = new Set([1, totalPages, currentPage]);
    for (let d = 1; d <= 2; d++) {
      if (currentPage - d >= 1)           pages.add(currentPage - d);
      if (currentPage + d <= totalPages)  pages.add(currentPage + d);
    }

    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      result.push(sorted[i]);
      if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) result.push('…');
    }
    return result;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
      <p className="text-xs text-gray-400 order-2 sm:order-1">
        Showing{' '}
        <span className="font-semibold text-gray-600">{from}–{to}</span>
        {' '}of{' '}
        <span className="font-semibold text-gray-600">{totalItems.toLocaleString()}</span>
        {' '}customers
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200
                     text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {getPages().map((pg, i) =>
          pg === '…' ? (
            <span key={`e${i}`} className="h-8 w-8 flex items-center justify-center text-gray-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={pg}
              onClick={() => onPageChange(pg)}
              className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium
                          transition-colors border
                          ${pg === currentPage
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
              aria-current={pg === currentPage ? 'page' : undefined}
            >
              {pg}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200
                     text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main table component
// ══════════════════════════════════════════════════════════════════════════════
export default function CustomersTable({
  customers, loading, pagination,
  onPageChange, onViewCustomer, onUpdateCustomer
}) {

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Scrollable table wrapper ─────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Customers table">

          {/* Column headers */}
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              {[
                { label: 'Customer',  cls: 'text-left   pl-4' },
                { label: 'Status',    cls: 'text-left' },
                { label: 'Orders',    cls: 'text-center' },
                { label: 'LTV',       cls: 'text-right' },
                { label: 'Location',  cls: 'text-left  hidden md:table-cell' },
                { label: 'Joined',    cls: 'text-left  hidden lg:table-cell' },
                { label: '',          cls: 'text-center pr-4 w-12' }
              ].map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-xs font-semibold text-gray-400
                              uppercase tracking-wider ${h.cls}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">No customers found</p>
                      <p className="text-xs mt-0.5">Try adjusting your search or filters</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map(customer => (
                <CustomerRow
                  key={customer._id}
                  customer={customer}
                  onView={onViewCustomer}
                  onUpdateCustomer={onUpdateCustomer}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination footer ────────────────────────────────────────────── */}
      {!loading && (
        <div className="px-4 pb-4">
          <Pagination pagination={pagination} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}

// ── Individual data row ───────────────────────────────────────────────────────
function CustomerRow({ customer, onView, onUpdateCustomer }) {
  return (
    <tr className="hover:bg-indigo-50/30 transition-colors group">

      {/* Customer info */}
      <td className="px-4 py-3 pl-4">
        <div className="flex items-center gap-3">
          {/* Avatar with initials */}
          <div
            className={`w-9 h-9 rounded-full ${avatarColor(customer.name)}
                        flex items-center justify-center text-white text-xs font-bold
                        flex-shrink-0 select-none`}
          >
            {initials(customer.name)}
          </div>

          {/* Name + email + segment pill */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onView(customer)}
                className="font-semibold text-gray-900 group-hover:text-indigo-700
                           truncate max-w-[120px] sm:max-w-[160px] text-left transition-colors"
              >
                {customer.name}
              </button>
              {customer.segment && customer.segment !== 'regular' && (
                <SegmentPip segment={customer.segment} />
              )}
            </div>
            <p className="text-xs text-gray-400 truncate max-w-[160px]">
              {customer.email}
            </p>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={customer.status} />
      </td>

      {/* Orders */}
      <td className="px-4 py-3 text-center">
        <span className="font-semibold text-gray-800">
          {(customer.totalOrders ?? 0).toLocaleString()}
        </span>
      </td>

      {/* LTV */}
      <td className="px-4 py-3 text-right">
        <span className="font-bold text-gray-900">
          {fmtMoney(customer.totalSpent)}
        </span>
      </td>

      {/* Location (hidden on small screens) */}
      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
        {customer.location?.city
          ? `${customer.location.city}, ${customer.location.country}`
          : <span className="text-gray-300">—</span>}
      </td>

      {/* Joined date (hidden on medium screens) */}
      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
        {fmtDate(customer.createdAt)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 pr-4 text-center">
        <ActionMenu
          customer={customer}
          onView={onView}
          onUpdateCustomer={onUpdateCustomer}
        />
      </td>
    </tr>
  );
}