'use client';
import { useEffect, useState, useCallback } from 'react';
import { X, ChevronDown, Loader2, Check } from 'lucide-react';
import { FulfillmentBadge, PaymentBadge } from './StatusBadge';
import { adminOrdersApi } from '@/lib/adminOrdersApi';

const STATUS_OPTIONS = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];

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

function AddressBlock({ title, address }) {
    if (!address || !address.street) {
        return (
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
                <p className="text-sm text-gray-400">Not provided</p>
            </div>
        );
    }
    return (
        <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
            <p className="text-sm text-gray-700">
                {address.street}<br />
                {address.city}, {address.state} {address.postalCode}<br />
                {address.country}
            </p>
        </div>
    );
}

export default function OrderDetailDrawer({ orderId, onClose, onOrderUpdated }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [savedTick, setSavedTick] = useState(false);

    const isOpen = Boolean(orderId);

    useEffect(() => {
        if (!orderId) return;
        let cancelled = false;
        setLoading(true);
        adminOrdersApi
            .getById(orderId)
            .then((data) => {
                if (cancelled) return;
                setOrder(data);
                setNotes(data.internalNotes || '');
            })
            .catch((err) => console.error('Failed to load order:', err))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [orderId]);

    const handleStatusChange = async (newStatus) => {
        setStatusMenuOpen(false);
        setUpdatingStatus(true);
        try {
            const { order: updated } = await adminOrdersApi.updateOrder(orderId, { orderStatus: newStatus });
            setOrder((prev) => ({ ...prev, orderStatus: updated.orderStatus }));
            onOrderUpdated?.();
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Save internal notes ~600ms after the admin stops typing.
    const saveNotes = useCallback(
        (value) => {
            setSavingNotes(true);
            adminOrdersApi
                .updateOrder(orderId, { internalNotes: value })
                .then(() => {
                    setSavingNotes(false);
                    setSavedTick(true);
                    setTimeout(() => setSavedTick(false), 1500);
                })
                .catch((err) => {
                    console.error('Failed to save notes:', err);
                    setSavingNotes(false);
                });
        },
        [orderId]
    );

    useEffect(() => {
        if (!orderId || notes === (order?.internalNotes || '')) return;
        const timer = setTimeout(() => saveNotes(notes), 600);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notes]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />

            <div className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col">
                {loading || !order ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="border-b border-gray-200 p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{order.displayId}</h2>
                                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                </div>
                                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                                <PaymentBadge status={order.paymentStatus} />

                                <div className="relative">
                                    <button
                                        onClick={() => setStatusMenuOpen((v) => !v)}
                                        disabled={updatingStatus}
                                        className="flex items-center gap-1"
                                    >
                                        <FulfillmentBadge status={order.orderStatus} />
                                        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                                    </button>
                                    {statusMenuOpen && (
                                        <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                                            {STATUS_OPTIONS.map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusChange(status)}
                                                    className="w-full text-left px-4 py-2 text-sm capitalize text-gray-700 hover:bg-gray-100"
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {updatingStatus && <Loader2 className="h-3.5 w-3.5 text-gray-400 animate-spin" />}
                            </div>
                        </div>

                        {/* Scrollable body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {/* Product breakdown */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Items</h3>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Item</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">SKU</th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Unit</th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Qty</th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(order.orderItems || []).map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-3 py-2">
                                                        <div className="flex items-center gap-2">
                                                            {item.image ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={item.image} alt={item.name} className="h-9 w-9 rounded object-cover border border-gray-200" />
                                                            ) : (
                                                                <div className="h-9 w-9 rounded bg-gray-100 border border-gray-200" />
                                                            )}
                                                            <div>
                                                                <p className="text-gray-900 font-medium">{item.name}</p>
                                                                <p className="text-xs text-gray-500">{item.size} · {item.color}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-500">{item.sku || '—'}</td>
                                                    <td className="px-3 py-2 text-right text-gray-700">${Number(item.price).toFixed(2)}</td>
                                                    <td className="px-3 py-2 text-right text-gray-700">{item.quantity}</td>
                                                    <td className="px-3 py-2 text-right font-medium text-gray-900">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-end mt-2 text-sm text-gray-600">
                                    <div className="w-48 space-y-1">
                                        <div className="flex justify-between"><span>Items</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span>Shipping</span><span>${order.shippingPrice?.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
                                        <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
                                            <span>Total</span><span>${order.totalPrice?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer details */}
                            <div className="border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <AddressBlock title="Shipping address" address={order.shippingAddress} />
                                <AddressBlock title="Billing address" address={order.billingAddress?.street ? order.billingAddress : order.shippingAddress} />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                                    <p className="text-sm text-gray-700">{order.phone || order.user?.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Customer</p>
                                    <p className="text-sm text-gray-700">{order.user?.name}</p>
                                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                                </div>
                            </div>

                            {/* Internal notes */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-semibold text-gray-900">Internal admin notes</h3>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        {savingNotes && <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>}
                                        {savedTick && <><Check className="h-3 w-3 text-green-500" /> Saved</>}
                                    </span>
                                </div>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    placeholder="Notes visible only to admins — not shown to the customer…"
                                    className="w-full text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
