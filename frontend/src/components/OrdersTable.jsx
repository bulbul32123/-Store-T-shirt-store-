'use client';
import { useState } from 'react';
import { MoreVertical, Eye } from 'lucide-react';
import { PaymentBadge, FulfillmentBadge } from './StatusBadge';

function formatDate(iso) {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function formatCurrency(value) {
    return `$${Number(value).toFixed(2)}`;
}

export default function OrdersTable({ orders, loading, selectedIds, onToggleSelect, onToggleSelectAll, onOpenOrder }) {
    const [openMenuId, setOpenMenuId] = useState(null);
    const allSelected = orders.length > 0 && selectedIds.length === orders.length;

    if (loading) {
        return (
            <div className="p-10 text-center text-sm text-gray-500">Loading orders…</div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="p-10 text-center text-sm text-gray-500">
                No orders match these filters. Try adjusting search, status, or date range.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 w-10">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(e) => onToggleSelectAll(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date &amp; Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fulfillment</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(order.id)}
                                    onChange={() => onToggleSelect(order.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </td>
                            <td className="px-4 py-3">
                                <button
                                    onClick={() => onOpenOrder(order.id)}
                                    className="text-sm font-semibold text-blue-600 hover:underline"
                                >
                                    {order.displayId}
                                </button>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                {formatDate(order.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                                <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                                <p className="text-xs text-gray-500">{order.customer.email}</p>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                                {formatCurrency(order.totalPrice)}
                            </td>
                            <td className="px-4 py-3">
                                <PaymentBadge status={order.paymentStatus} />
                            </td>
                            <td className="px-4 py-3">
                                <FulfillmentBadge status={order.orderStatus} />
                            </td>
                            <td className="px-4 py-3 text-right relative">
                                <button
                                    onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100"
                                >
                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                </button>
                                {openMenuId === order.id && (
                                    <div className="absolute right-4 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                                        <button
                                            onClick={() => {
                                                onOpenOrder(order.id);
                                                setOpenMenuId(null);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View details
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
