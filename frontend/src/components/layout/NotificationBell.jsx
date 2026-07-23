"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/context/NotificationContext";
import { formatDistanceToNow } from "@/utils/formatters";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Info,
  MessageCircle,
  Package,
  Percent,
  Star,
  Tag,
  XCircle,
} from "lucide-react";
import Link from "next/link";

const ICONS = {
  new_product: Tag,
  discount: Percent,
  coupon: Percent,
  review_added: Star,
  order_update: Package,
  order_cancelled: XCircle,
  chat_message: MessageCircle,
  system: Info,
  review_deleted: AlertTriangle,
};

function NotificationRow({ n, markAsRead }) {
  const Icon = ICONS[n.type] || Info;

  const content = (
    <>
      <div className="h-8 w-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
        <Icon size={14} className="text-[#111]" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#111] line-clamp-1">
          {n.title}
        </p>
        <p className="text-xs text-[#6F6F6F] line-clamp-2">{n.message}</p>
        <p className="text-[10px] text-[#6F6F6F] mt-1">
          {formatDistanceToNow(n.createdAt)}
        </p>
      </div>
      {!n.isRead && (
        <span className="h-2 w-2 rounded-full bg-[#FF5A1F] shrink-0 mt-1.5 ml-auto" />
      )}
    </>
  );

  const rowClass = `flex gap-3 px-4 py-3 hover:bg-[#F5F5F5] transition-colors w-full text-left ${
    !n.isRead ? "bg-[#FF5A1F]/5" : ""
  }`;

  if (n.type === "chat_message") {
    return (
      <button
        type="button"
        onClick={() => {
          if (!n.isRead) markAsRead(n._id);
          window.dispatchEvent(
            new CustomEvent("open-support-chat", {
              detail: { chatId: n.meta?.chatId },
            }),
          );
        }}
        className={rowClass}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={n.link || "/profile/notifications"}
      onClick={() => !n.isRead && markAsRead(n._id)}
      className={rowClass}
    >
      {content}
    </Link>
  );
}

export default function NotificationBell() {
  const { notifications, markAllAsRead, unreadCount, markAsRead, user } =
    useNotifications();
  const recent = notifications.slice(0, 6);

  if (!user) return;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative hover:text-gray-500 transition-colors max-md:p-3 max-md:rounded-full max-md:bg-primary max-md:hover:bg-black max-md:text-white max-md:hover:text-white transitions"
        >
          <Bell size={25} className="max-h-6 max-w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#FF5A1F] text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
          <p className="text-sm font-bold uppercase tracking-tight text-[#111]">
            Notifications
          </p>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-medium text-[#ffb800] hover:text-[#ffb800]/80"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell
              size={22}
              className="mx-auto text-[#6F6F6F] mb-2"
              strokeWidth={1.5}
            />
            <p className="text-sm text-[#6F6F6F]">
              Nothing yet — new drops and updates will show up here.
            </p>
          </div>
        ) : (
          <ul className="max-h-96 overflow-y-auto divide-y divide-[#E5E5E5]">
            {recent.map((n) => (
              <li key={n._id}>
                <NotificationRow n={n} markAsRead={markAsRead} />
              </li>
            ))}
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
