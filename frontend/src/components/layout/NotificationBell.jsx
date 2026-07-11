// NotificationBell on the navbar component
'use client';
import Link from 'next/link';
import { Bell, Tag, Percent, Star, Package, Info,AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from '@/utils/formatters';

const ICONS = {
    new_product: Tag,
    discount: Percent,
    coupon: Percent,
    review_added: Star,
    order_update: Package,
    system: Info,
    review_deleted: AlertTriangle,
};

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const recent = notifications.slice(0, 6);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button type="button" aria-label="Notifications" className="relative hover:text-gray-500 transition-colors">
                    <Bell size={25} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#FF5A1F] text-white text-[10px] font-bold flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
                    <p className="text-sm font-bold uppercase tracking-tight text-[#111]">Notifications</p>
                    {unreadCount > 0 && (
                        <span className="text-xs text-[#6F6F6F]">{unreadCount} unread</span>
                    )}
                </div>

                {recent.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                        <Bell size={22} className="mx-auto text-[#6F6F6F] mb-2" strokeWidth={1.5} />
                        <p className="text-sm text-[#6F6F6F]">Nothing yet — new drops and updates will show up here.</p>
                    </div>
                ) : (
                    <ul className="max-h-96 overflow-y-auto divide-y divide-[#E5E5E5]">
                        {recent.map((n) => {
                            const Icon = ICONS[n.type] || Info;
                            return (
                                <li key={n._id}>
                                    <Link
                                        href={n.link || '/profile/notifications'}
                                        onClick={() => !n.isRead && markAsRead(n._id)}
                                        className={`flex gap-3 px-4 py-3 hover:bg-[#F5F5F5] transition-colors ${
                                            !n.isRead ? 'bg-[#FF5A1F]/5' : ''
                                        }`}
                                    >
                                        <div className="h-8 w-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
                                            <Icon size={14} className="text-[#111]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-[#111] line-clamp-1">{n.title}</p>
                                            <p className="text-xs text-[#6F6F6F] line-clamp-2">{n.message}</p>
                                            <p className="text-[10px] text-[#6F6F6F] mt-1">
                                                {formatDistanceToNow(n.createdAt)}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <span className="h-2 w-2 rounded-full bg-[#FF5A1F] shrink-0 mt-1.5 ml-auto" />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <Link
                    href="/profile/notifications"
                    className="block text-center text-xs font-bold uppercase tracking-wide py-3 border-t border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#111]"
                >
                    View all
                </Link>
            </PopoverContent>
        </Popover>
    );
}