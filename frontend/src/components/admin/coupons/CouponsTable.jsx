'use client';

import ToggleSwitch from './ToggleSwitch';

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusBadge(coupon) {
    const expired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
    const exhausted = coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit;

    if (expired) return { label: 'Expired', classes: 'bg-gray-100 text-gray-600' };
    if (!coupon.isActive) return { label: 'Inactive', classes: 'bg-amber-50 text-amber-700' };
    if (exhausted) return { label: 'Exhausted', classes: 'bg-rose-50 text-rose-600' };
    return { label: 'Active', classes: 'bg-emerald-50 text-emerald-700' };
}

const TABLE_HEADINGS = ['Code', 'Type', 'Value', 'Expiry', 'Used / Limit', 'Status', 'Actions'];

export default function CouponsTable({ coupons, onToggleStatus, onDelete, togglingId, deletingId }) {
    if (!coupons.length) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
                <p className="text-sm font-medium text-gray-700">No coupons yet</p>
                <p className="mt-1 text-xs text-gray-400">Create your first coupon to get started.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        {TABLE_HEADINGS.map((heading) => (
                            <th
                                key={heading}
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                            >
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {coupons.map((coupon) => {
                        const badge = getStatusBadge(coupon);
                        return (
                            <tr key={coupon._id} className="hover:bg-gray-50/60">
                                <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-800">{coupon.code}</td>
                                <td className="px-4 py-3 capitalize text-gray-600">{coupon.discountType}</td>
                                <td className="px-4 py-3 text-gray-600">
                                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{formatDate(coupon.expiryDate)}</td>
                                <td className="px-4 py-3 text-gray-600">
                                    {coupon.usedCount ?? 0} / {coupon.usageLimit ?? '∞'}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badge.classes}`}>
                                        {badge.label}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <ToggleSwitch
                                            checked={coupon.isActive}
                                            disabled={togglingId === coupon._id}
                                            onChange={() => onToggleStatus(coupon)}
                                            label={`Toggle ${coupon.code} status`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => onDelete(coupon)}
                                            disabled={deletingId === coupon._id}
                                            className="text-xs font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
                                        >
                                            {deletingId === coupon._id ? 'Deleting…' : 'Delete'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}