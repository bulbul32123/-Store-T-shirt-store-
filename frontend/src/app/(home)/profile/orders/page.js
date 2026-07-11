// /profile/order/page.js
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ordersApi } from '@/lib/ordersApi';

const ACTIVE_STATUSES = ['pending', 'processing', 'confirmed', 'shipped'];

const STATUS_STYLES = {
    pending: 'bg-gray-100 text-gray-700',
    processing: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function ProfileOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('current');

    useEffect(() => {
        ordersApi.getMyOrders()
            .then(setOrders)
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = orders.filter((o) =>
        tab === 'current'
            ? ACTIVE_STATUSES.includes(o.orderStatus)
            : ['delivered', 'cancelled'].includes(o.orderStatus)
    );

    if (loading) {
        return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">Loading orders...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6">Orders</h1>

            <div className="flex gap-2 mb-8 border-b">
                {['current', 'history'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
                            tab === t ? 'border-black text-black' : 'border-transparent text-gray-400'
                        }`}
                    >
                        {t === 'current' ? 'Current Orders' : 'Order History'}
                    </button>
                ))}
            </div>

            {!filtered.length ? (
                <div className="text-center py-24 text-gray-500">
                    No {tab === 'current' ? 'active' : 'past'} orders yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((order) => (
                        <Link
                            key={order._id}
                            href={`/profile/orders/${order._id}`}
                            className="flex items-center justify-between border rounded-2xl p-5 hover:border-black transition"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                    {order.orderItems?.[0]?.image && (
                                        <Image
                                            src={order.orderItems[0].image}
                                            alt={order.orderItems[0].name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold">Order #{order.orderNumber}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()} · {order.orderItems.length} item(s)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${STATUS_STYLES[order.orderStatus]}`}>
                                    {order.orderStatus}
                                </span>
                                <span className="font-bold">${order.totalPrice.toFixed(2)}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}