"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { useAdminNotifications } from "@/context/AdminNotificationContext";
import {
  Bell,
  ShoppingBag,
  UserPlus,
  Star,
  Flag,
  Trash2,
  Package,
  CheckCheck,
} from "lucide-react";

const TYPE_CONFIG = {
  new_order: { icon: ShoppingBag, bg: "bg-blue-50", fg: "text-blue-600" },
  new_customer: { icon: UserPlus, bg: "bg-green-50", fg: "text-green-600" },
  review_added: { icon: Star, bg: "bg-amber-50", fg: "text-amber-600" },
  review_reported: { icon: Flag, bg: "bg-red-50", fg: "text-red-600" },
  review_deleted: { icon: Trash2, bg: "bg-gray-100", fg: "text-gray-600" },
  order_update: { icon: Package, bg: "bg-purple-50", fg: "text-purple-600" },
  system: { icon: Bell, bg: "bg-gray-100", fg: "text-gray-600" },
};

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function groupByDay(list) {
  const today = [],
    earlier = [];
  const now = new Date();
  list.forEach((n) => {
    const isToday = new Date(n.createdAt).toDateString() === now.toDateString();
    (isToday ? today : earlier).push(n);
  });
  return { today, earlier };
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useAdminNotifications();

  const toggleDropdown = () => setIsOpen((p) => !p);
  const closeDropdown = () => setIsOpen(false);

  const handleItemClick = (n) => {
    if (!n.isRead) markAsRead(n._id);
    closeDropdown();
    if (n.link) router.push(n.link);
  };

  const { today, earlier } = groupByDay(notifications);

  const renderItem = (n) => {
    const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
    const Icon = config.icon;
    return (
      <li key={n._id}>
        <button
          onClick={() => handleItemClick(n)}
          className={`w-full flex gap-3 rounded-lg p-3 text-left transition hover:bg-gray-50 ${!n.isRead ? "bg-blue-50/40" : ""}`}
        >
          <span
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${config.bg}`}
          >
            <Icon className={`h-4 w-4 ${config.fg}`} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-gray-800 truncate">
                {n.title}
              </span>
              {!n.isRead && (
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
              )}
            </span>
            <span className="block text-sm text-gray-500 line-clamp-2">
              {n.message}
            </span>
            <span className="mt-1 block text-xs text-gray-400">
              {timeAgo(n.createdAt)}
            </span>
          </span>
        </button>
      </li>
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="dropdown-toggle relative flex items-center justify-center text-black transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100"
        onClick={toggleDropdown}
      >
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white pointer-events-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <Bell className="h-5 w-5 pointer-events-none" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute mt-2 lg:mt-[17px] flex h-[480px] w-[360px] flex-col rounded-2xl border border-gray-100 bg-white text-black p-3 shadow-theme-lg sm:w-[380px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
          <h5 className="text-lg font-semibold text-gray-800">
            Notifications{" "}
            {unreadCount > 0 && (
              <span className="text-sm font-normal text-gray-400">
                ({unreadCount} new)
              </span>
            )}
          </h5>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Loading…
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
              <Bell className="h-8 w-8" />
              <span className="text-sm">No notifications yet</span>
            </div>
          ) : (
            <>
              {today.length > 0 && (
                <>
                  <p className="px-1 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Today
                  </p>
                  <ul className="flex flex-col gap-0.5 mb-2">
                    {today.map(renderItem)}
                  </ul>
                </>
              )}
              {earlier.length > 0 && (
                <>
                  <p className="px-1 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Earlier
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {earlier.map(renderItem)}
                  </ul>
                </>
              )}
            </>
          )}
        </div>

        <Link
          href="/admin/notifications"
          onClick={closeDropdown}
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
