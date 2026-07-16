"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { API_URL } from "@/utils/config";
import { getSocket } from "@/lib/socket";
import { useAdminNotifications } from "@/context/AdminNotificationContext";
import { TYPE_CONFIG, FILTER_TABS, timeAgo } from "@/utils/notificationTypes";

const LIMIT = 15;

function SkeletonRow() {
  return (
    <div className="flex gap-3 p-4 border-b border-gray-100 animate-pulse">
      <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 bg-gray-200 rounded" />
        <div className="h-3 w-2/3 bg-gray-200 rounded" />
        <div className="h-2.5 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const {
    markAsRead: ctxMarkAsRead,
    markAllAsRead: ctxMarkAllAsRead,
    deleteNotification: ctxDelete,
    bulkDelete: ctxBulkDelete,
  } = useAdminNotifications();

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const tab = FILTER_TABS.find((t) => t.key === activeTab);
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (tab.statusOnly) params.set("status", "unread");
      if (tab.types) params.set("types", tab.types.join(","));
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

      const res = await fetch(
        `${API_URL}/api/notifications/admin/all?${params}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
      setHasNew(false);
    }
  }, [activeTab, page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch]);
  useEffect(() => {
    fetchList();
  }, [fetchList]);
  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab, page, debouncedSearch]);

  // Live "new notification" banner instead of merging into paginated list
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    const handleNew = (n) => {
      if (n.audience === "admin") setHasNew(true);
    };
    socket.on("notification:new", handleNew);
    return () => socket.off("notification:new", handleNew);
  }, []);

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const toggleSelectAll = () =>
    setSelectedIds(
      selectedIds.length === notifications.length
        ? []
        : notifications.map((n) => n._id),
    );

  const handleItemClick = (n) => {
    if (!n.isRead) {
      ctxMarkAsRead(n._id);
      setNotifications((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)),
      );
    }
    if (n.link) router.push(n.link);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    ctxDelete(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    setTotal((prev) => Math.max(0, prev - 1));
  };

  const handleBulkDelete = () => {
    ctxBulkDelete(selectedIds);
    setNotifications((prev) =>
      prev.filter((n) => !selectedIds.includes(n._id)),
    );
    setTotal((prev) => Math.max(0, prev - selectedIds.length));
    setSelectedIds([]);
  };

  const handleMarkAllRead = () => {
    ctxMarkAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-gray-500">
            {total} total notification{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50"
        >
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-4 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.key
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications…"
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* New notifications banner */}
        {hasNew && (
          <button
            onClick={fetchList}
            className="mx-4 mt-3 w-[calc(100%-2rem)] text-center text-sm font-medium text-blue-600 bg-blue-50 rounded-lg py-2 hover:bg-blue-100"
          >
            New notifications arrived — click to refresh
          </button>
        )}

        {/* Bulk action bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between mx-4 mt-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <span className="text-sm text-gray-600">
              {selectedIds.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        )}

        {/* List */}
        <div className="mt-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
              <Bell className="h-10 w-10" />
              <p className="text-sm">No notifications found</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100">
                <input
                  type="checkbox"
                  checked={selectedIds.length === notifications.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Select all
                </span>
              </div>
              {notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                const Icon = config.icon;
                return (
                  <div
                    key={n._id}
                    onClick={() => handleItemClick(n)}
                    className={`group flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${!n.isRead ? "bg-blue-50/40" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(n._id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelect(n._id)}
                      className="h-4 w-4 mt-1 rounded border-gray-300 shrink-0"
                    />
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${config.fg}`} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </span>
                      <span className="block text-sm text-gray-500 mt-0.5">
                        {n.message}
                      </span>
                      <span className="block text-xs text-gray-400 mt-1">
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                    <button
                      onClick={(e) => handleDelete(n._id, e)}
                      className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-red-50 shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
