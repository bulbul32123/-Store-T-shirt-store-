"use client";

import ChatSidebar from "@/components/admin/support/ChatSidebar";
import ChatThread from "@/components/admin/support/ChatThread";
import CustomerPanel from "@/components/admin/support/CustomerPanel";
import { useAdminNotifications } from "@/context/AdminNotificationContext";
import { adminChatApi } from "@/lib/adminChatApi";
import { getSocket } from "@/lib/socket";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

function SupportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [onlineIds, setOnlineIds] = useState(new Set());
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const joinedRoom = useRef(null);
  const { markChatRead } = useAdminNotifications();

  const fetchChats = useCallback(() => {
    adminChatApi
      .getChats()
      .then(({ chats }) => setChats(chats))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const selectChat = useCallback(
    (id) => {
      setThreadLoading(true);
      adminChatApi
        .getChatById(id)
        .then(({ chat }) => {
          setActiveChat(chat);
          setChats((prev) =>
            prev.map((c) => (c._id === id ? { ...c, unreadByAdmin: 0 } : c)),
          );
          markChatRead(id);
          const socket = getSocket();
          if (!socket.connected) socket.connect();
          if (joinedRoom.current !== id) {
            socket.emit("join_admin_room", id);
            joinedRoom.current = id;
          }
        })
        .catch(() => toast.error("This chat no longer exists"))
        .finally(() => setThreadLoading(false));
    },
    [markChatRead],
  );

  useEffect(() => {
    const chatId = searchParams.get("chatId");
    if (chatId) {
      selectChat(chatId);
      router.replace("/admin/support", { scroll: false });
    }
  }, [searchParams, selectChat, router]);

  const handleDeleteChat = async (id) => {
    try {
      await adminChatApi.deleteChat(id);
      setChats((prev) => prev.filter((c) => c._id !== id));
      if (activeChat?._id === id) setActiveChat(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const handleNewMessage = (data) => {
      if (activeChat?._id === data.roomId) {
        setActiveChat((prev) => ({
          ...prev,
          messages: [
            ...(prev.messages || []),
            {
              sender: data.sender,
              content: data.text,
              timestamp: data.timestamp,
            },
          ],
        }));
      }
    };
    const handleChatUpdated = ({ roomId, lastMessage }) => {
      setChats((prev) => {
        const idx = prev.findIndex((c) => c._id === roomId);
        if (idx === -1) {
          fetchChats();
          return prev;
        }
        const updated = {
          ...prev[idx],
          lastMessage,
          lastUpdated: lastMessage.timestamp,
        };
        if (lastMessage.sender === "user" && activeChat?._id !== roomId) {
          updated.unreadByAdmin = (prev[idx].unreadByAdmin || 0) + 1;
        }
        const rest = prev.filter((_, i) => i !== idx);
        return [updated, ...rest];
      });
    };
    const handleStatus = ({ userId, online }) => {
      setOnlineIds((prev) => {
        const next = new Set(prev);
        online ? next.add(userId) : next.delete(userId);
        return next;
      });
    };

    socket.on("new_message", handleNewMessage);
    socket.on("chat:updated", handleChatUpdated);
    socket.on("customer_status", handleStatus);
    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("chat:updated", handleChatUpdated);
      socket.off("customer_status", handleStatus);
    };
  }, [activeChat, fetchChats]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-white rounded-xl border border-gray-200">
      <ChatSidebar
        chats={chats}
        activeId={activeChat?._id}
        onlineIds={onlineIds}
        onSelect={selectChat}
        onClose={handleDeleteChat}
        collapsed={leftCollapsed}
        onToggleCollapse={() => setLeftCollapsed((v) => !v)}
      />
      <ChatThread
        chat={activeChat}
        loading={threadLoading}
        online={onlineIds.has(activeChat?.user?._id)}
      />
      <CustomerPanel
        chat={activeChat}
        collapsed={rightCollapsed}
        onToggleCollapse={() => setRightCollapsed((v) => !v)}
      />
    </div>
  );
}

export default function AdminSupportPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-gray-500">Loading support chat...</div>
      }
    >
      <SupportContent />
    </Suspense>
  );
}
