import {
  ShoppingBag,
  UserPlus,
  Star,
  Flag,
  Trash2,
  Package,
  Bell,
  MessageCircle,
  XCircle,
} from "lucide-react";

export const TYPE_CONFIG = {
  new_order: {
    icon: ShoppingBag,
    bg: "bg-blue-50",
    fg: "text-blue-600",
    label: "New Order",
  },
  new_customer: {
    icon: UserPlus,
    bg: "bg-green-50",
    fg: "text-green-600",
    label: "New Customer",
  },
  review_added: {
    icon: Star,
    bg: "bg-amber-50",
    fg: "text-amber-600",
    label: "New Review",
  },
  review_reported: {
    icon: Flag,
    bg: "bg-red-50",
    fg: "text-red-600",
    label: "Reported",
  },
  review_deleted: {
    icon: Trash2,
    bg: "bg-gray-100",
    fg: "text-gray-600",
    label: "Review Removed",
  },
  order_update: {
    icon: Package,
    bg: "bg-purple-50",
    fg: "text-purple-600",
    label: "Order Update",
  },
  order_cancelled: {
    icon: XCircle,
    bg: "bg-rose-50",
    fg: "text-rose-600",
    label: "Order Cancelled",
  }, // ADD
  chat_message: {
    icon: MessageCircle,
    bg: "bg-cyan-50",
    fg: "text-cyan-600",
    label: "Support Chat",
  }, // ADD
  system: {
    icon: Bell,
    bg: "bg-gray-100",
    fg: "text-gray-600",
    label: "System",
  },
};

export const FILTER_TABS = [
  { key: "all", label: "All", types: null },
  { key: "unread", label: "Unread", types: null, statusOnly: true },
  {
    key: "orders",
    label: "Orders",
    types: ["new_order", "order_update", "order_cancelled"],
  }, // updated
  {
    key: "reviews",
    label: "Reviews",
    types: ["review_added", "review_deleted"],
  },
  { key: "reported", label: "Reported", types: ["review_reported"] },
  { key: "customers", label: "Customers", types: ["new_customer"] },
  { key: "messages", label: "Messages", types: ["chat_message"] }, // ADD
];

export function timeAgo(date) {
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
