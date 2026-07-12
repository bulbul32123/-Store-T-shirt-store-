"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { getSocket } from "@/lib/socket";
import { API_URL } from "@/utils/config";

const AdminNotificationContext = createContext(null);

export function AdminNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/notifications/admin/all?limit=30`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch (err) {
      console.error("Failed to fetch admin notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/notifications/admin/unread-count`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success) setUnreadCount(data.count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await fetch(`${API_URL}/api/notifications/admin/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await fetch(`${API_URL}/api/notifications/admin/read-all`, {
        method: "PUT",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  }, []);
    
    const deleteNotification = useCallback(
      async (id) => {
        setNotifications((prev) => {
          const target = prev.find((n) => n._id === id);
          if (target && !target.isRead)
            setUnreadCount((c) => Math.max(0, c - 1));
          return prev.filter((n) => n._id !== id);
        });
        try {
          await fetch(`${API_URL}/api/notifications/admin/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
        } catch (err) {
          console.error("Failed to delete notification", err);
          fetchNotifications();
          fetchUnreadCount();
        }
      },
      [fetchNotifications, fetchUnreadCount],
    );

    const bulkDelete = useCallback(
      async (ids) => {
        setNotifications((prev) => {
          const removedUnread = prev.filter(
            (n) => ids.includes(n._id) && !n.isRead,
          ).length;
          if (removedUnread)
            setUnreadCount((c) => Math.max(0, c - removedUnread));
          return prev.filter((n) => !ids.includes(n._id));
        });
        try {
          await fetch(`${API_URL}/api/notifications/admin/bulk-delete`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
          });
        } catch (err) {
          console.error("Failed to bulk delete", err);
          fetchNotifications();
          fetchUnreadCount();
        }
      },
      [fetchNotifications, fetchUnreadCount],
    );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    fetchNotifications();
    fetchUnreadCount();

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const handleNew = (notification) => {
      if (notification.audience !== "admin") return;
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification:new", handleNew);
    return () => socket.off("notification:new", handleNew);
  }, [fetchNotifications, fetchUnreadCount]);

  return (
    <AdminNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
              loading,
              deleteNotification,
        bulkDelete,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
}

export const useAdminNotifications = () => {
  const ctx = useContext(AdminNotificationContext);
  if (!ctx)
    throw new Error(
      "useAdminNotifications must be used within AdminNotificationProvider",
    );
  return ctx;
};
