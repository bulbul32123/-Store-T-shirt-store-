// NotificationContext.js
"use client";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/lib/socket";
import { API_URL } from "@/utils/config";
import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

const POLL_MS = 30000;

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const userId = user?._id || user?.id;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pollRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await axios.get(
        `${API_URL}/api/notifications/unread-count`,
      );
      if (data.success) setUnreadCount(data.count);
    } catch {
      // silent — polling will retry
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(
    async (targetPage = 1) => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/api/notifications`, {
          params: { page: targetPage, limit: 20 },
        });
        if (data.success) {
          setNotifications(
            targetPage === 1
              ? data.notifications
              : (prev) => [...prev, ...data.notifications],
          );
          setPage(data.page);
          setTotalPages(data.totalPages);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated],
  );

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await axios.put(`${API_URL}/api/notifications/${id}/read`);
    } catch {
      fetchUnreadCount(); // resync on failure
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await axios.put(`${API_URL}/api/notifications/read-all`);
    } catch {
      fetchUnreadCount();
    }
  };
  const markChatRead = async (chatId) => {
    try {
      await axios.put(`${API_URL}/api/notifications/chat/${chatId}/read`);
      fetchUnreadCount();
      fetchNotifications(1);
    } catch {
      /* silent */
    }
  };

  const removeNotification = async (id) => {
    const prevList = notifications;
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await axios.delete(`${API_URL}/api/notifications/${id}`);
    } catch {
      setNotifications(prevList); // roll back on failure
    }
  };

  const loadMore = () => {
    if (page < totalPages && !loading) fetchNotifications(page + 1);
  };

  useEffect(() => {
    // reset immediately on any account change — stops stale counts bleeding across users
    setNotifications([]);
    setUnreadCount(0);

    if (!isAuthenticated) return;

    fetchUnreadCount();
    fetchNotifications(1);

    pollRef.current = setInterval(fetchUnreadCount, POLL_MS);

    const socket = getSocket();
    if (socket.connected) socket.disconnect(); // force re-handshake so it re-authenticates as the NEW user
    socket.connect();

    const handleNewNotification = (notification) => {
      if (notification.audience === "admin") return;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      if (notification.type !== "chat_message")
        toast(notification.title, { icon: "🔔" });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      clearInterval(pollRef.current);
      socket.off("notification:new", handleNewNotification);
      socket.disconnect();
    };
  }, [isAuthenticated, userId, fetchUnreadCount, fetchNotifications]); // userId added

  const value = {
    notifications,
    unreadCount,
    markChatRead,
    loading,
    page,
    totalPages,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
