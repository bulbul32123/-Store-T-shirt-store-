'use client';

import Link from 'next/link';
import { Bell, Tag, Percent, Star, Package, Info, Trash2 } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from '@/utils/formatters';

const ICONS = {
    new_product: Tag,
    discount: Percent,
    coupon: Percent,
    review_added: Star,
    order_update: Package,
    system: Info,
};

export default function NotificationsPanel() {
    const { notifications, unreadCount, loading, page, totalPages, markAsRead, markAllAsRead, removeNotification, loadMore } =
        useNotifications();

    if (notifications.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-[#E5E5E5] rounded-2xl">
                <Bell size={32} strokeWidth={1.5} className="text-[#6F6F6F] mb-4" />
                <h3 className="text-lg font-bold uppercase tracking-tight text-[#111] mb-1">All quiet</h3>
                <p className="text-sm text-[#6F6F6F] max-w-xs">
                    New products, discounts, coupons, and review activity will show up here.
                </p>
            </div>
        );
    }

    return (
        <div>
            {unreadCount > 0 && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold uppercase tracking-wide text-[#111] hover:underline"
                    >
                        Mark all as read
                    </button>
                </div>
            )}

            <ul className="divide-y divide-[#E5E5E5]">
                {notifications.map((n) => {
                    const Icon = ICONS[n.type] || Info;
                    return (
                        <li key={n._id} className={`flex gap-4 py-4 ${!n.isRead ? 'bg-[#FF5A1F]/5 -mx-4 px-4 rounded-lg' : ''}`}>
                            <div className="h-10 w-10 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
                                <Icon size={16} className="text-[#111]" />
                            </div>

                            <Link
                                href={n.link || '#'}
                                onClick={() => !n.isRead && markAsRead(n._id)}
                                className="flex-1 min-w-0"
                            >
                                <p className="text-sm font-bold text-[#111]">{n.title}</p>
                                <p className="text-sm text-[#6F6F6F] mt-0.5">{n.message}</p>
                                <p className="text-xs text-[#6F6F6F] mt-1.5">{formatDistanceToNow(n.createdAt)}</p>
                            </Link>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                                {!n.isRead && <span className="h-2 w-2 rounded-full bg-[#FF5A1F]" />}
                                {!n.isGlobal && (
                                    <button
                                        onClick={() => removeNotification(n._id)}
                                        aria-label="Delete notification"
                                        className="text-[#6F6F6F] hover:text-[#111]"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>

            {page < totalPages && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="rounded-full border border-[#111] text-[#111] text-xs font-bold uppercase tracking-wide px-6 py-2.5 hover:bg-[#111] hover:text-white transition-colors disabled:opacity-40"
                    >
                        {loading ? 'Loading…' : 'Load more'}
                    </button>
                </div>
            )}
        </div>
    );
}