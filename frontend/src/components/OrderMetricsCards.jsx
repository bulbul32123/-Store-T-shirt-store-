'use client';
import { Package, Clock, DollarSign, RotateCcw } from 'lucide-react';

const CARD_CONFIG = [
    {
        key: 'totalOrders',
        label: 'Total Orders',
        icon: Package,
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        format: (v) => v.toLocaleString()
    },
    {
        key: 'pendingFulfillment',
        label: 'Pending Fulfillment',
        icon: Clock,
        border: 'border-amber-200',
        bg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        format: (v) => v.toLocaleString()
    },
    {
        key: 'totalRevenue',
        label: 'Total Revenue',
        icon: DollarSign,
        border: 'border-green-200',
        bg: 'bg-green-50',
        iconColor: 'text-green-600',
        format: (v) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
        key: 'refundedOrCancelled',
        label: 'Refunded / Cancelled',
        icon: RotateCcw,
        border: 'border-red-200',
        bg: 'bg-red-50',
        iconColor: 'text-red-600',
        format: (v) => v.toLocaleString()
    }
];

export default function OrderMetricsCards({ summary, loading }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {CARD_CONFIG.map(({ key, label, icon: Icon, border, bg, iconColor, format }) => (
                <div
                    key={key}
                    className={`rounded-xl border ${border} ${bg} p-5 flex items-center justify-between`}
                >
                    <div>
                        <p className="text-sm font-medium text-gray-600">{label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            {loading ? (
                                <span className="inline-block h-7 w-20 bg-gray-200 rounded animate-pulse" />
                            ) : (
                                format(summary[key] || 0)
                            )}
                        </p>
                    </div>
                    <div className={`h-11 w-11 rounded-full bg-white flex items-center justify-center shadow-sm`}>
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                </div>
            ))}
        </div>
    );
}
