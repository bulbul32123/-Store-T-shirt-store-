"use client";
  import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { chatApi } from "@/lib/chatApi";
import { getSocket } from "@/lib/socket";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatWidget() {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
    const { markChatRead } = useNotifications();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const scrollRef = useRef(null);
  const joinedRoom = useRef(null);

  // Load (or create) this customer's active chat once, regardless of open/closed state,
  // so the socket room is joined immediately and messages arrive even while collapsed.
  useEffect(() => {
    if (!isAuthenticated) return;
    chatApi
      .getMyChat()
      .then(({ chat }) => {
        setChatId(chat._id);
        setMessages(chat.messages || []);
      })
      .catch((err) => console.error("Failed to load chat:", err))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!chatId) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    if (joinedRoom.current !== chatId) {
      socket.emit("join_chat", chatId);
      joinedRoom.current = chatId;
    }

    const handleNew = (data) => {
      if (data.roomId !== chatId) return;
      setMessages((prev) => [
        ...prev,
        { sender: data.sender, content: data.text, timestamp: data.timestamp },
      ]);
      if (data.sender === "admin" && !isOpen) setHasUnread(true);
    };

    socket.on("new_message", handleNew);
    return () => socket.off("new_message", handleNew);
  }, [chatId, isOpen]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const toggleOpen = () => {
    setIsOpen((v) => {
      if (!v && chatId) markChatRead(chatId);
      return !v;
    });
    setHasUnread(false);
  };
  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !chatId) return;
    const socket = getSocket();
    socket.emit("send_message", { roomId: chatId, sender: "user", text });
    setInput(""); // removed the setMessages(...) optimistic line — socket echo handles it
  }, [input, chatId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const socket = getSocket();
    const handleClosed = ({ chatId: closedId }) => {
        if (closedId !== chatId) return;
        setMessages([{ sender: 'admin', content: 'This conversation has ended. Send a message to start a new chat.', timestamp: new Date().toISOString(), system: true }]);
        joinedRoom.current = null;
        chatApi.getMyChat()
            .then(({ chat }) => { setChatId(chat._id); setMessages([]); })
            .catch((err) => console.error('Failed to start new chat:', err));
    };
    socket.on('chat_closed', handleClosed);
    return () => socket.off('chat_closed', handleClosed);
}, [chatId]);

useEffect(() => {
  const handleOpenRequest = (e) => {
    const requestedChatId = e.detail?.chatId;
    // only auto-open if it matches this customer's own chat (or no chatId given)
    if (requestedChatId && chatId && requestedChatId !== chatId) return;
    setIsOpen(true);
    setHasUnread(false);
    if (chatId) markChatRead(chatId);
  };
  window.addEventListener("open-support-chat", handleOpenRequest);
  return () =>
    window.removeEventListener("open-support-chat", handleOpenRequest);
}, [chatId, markChatRead]);
  
  useEffect(() => {
    const socket = getSocket();
    const handleClosed = ({ chatId: closedId }) => {
      if (closedId !== chatId) return;
      setMessages([
        {
          sender: "admin",
          content:
            "This conversation has ended. Send a message to start a new chat.",
          timestamp: new Date().toISOString(),
          system: true,
        },
      ]);
      joinedRoom.current = null;
      chatApi
        .getMyChat()
        .then(({ chat }) => {
          setChatId(chat._id);
          setMessages([]);
        })
        .catch((err) => console.error("Failed to start new chat:", err));
    };
    socket.on("chat_closed", handleClosed);
    return () => socket.off("chat_closed", handleClosed);
  }, [chatId]);

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white flex-shrink-0">
            <div>
              <p className="text-sm font-semibold">Support</p>
              <p className="text-xs text-gray-300">
                We usually reply within a few minutes
              </p>
            </div>
            <button
              onClick={toggleOpen}
              className="p-1.5 rounded-lg hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50"
          >
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-400 px-6">
                <MessageCircle className="h-8 w-8 mb-2" />
                <p className="text-sm">
                  Send us a message and we'll get back to you shortly.
                </p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                      m.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {m.content}
                    </p>
                    <p
                      className={`text-[10px] mt-1 ${m.sender === "user" ? "text-blue-100" : "text-gray-400"}`}
                    >
                      {formatTime(m.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-200 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating bubble */}
      <button
        onClick={toggleOpen}
        className="relative h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700 transition"
      >
        {hasUnread && (
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white" />
        )}
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
