"use client";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { chatApi } from "@/lib/chatApi";
import { getSocket } from "@/lib/socket";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

function formatTime(iso) {
  if (!iso) return "";
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

    const doJoin = () => {
      socket.emit("join_chat", chatId);
      joinedRoom.current = chatId;
    };

    if (joinedRoom.current !== chatId) doJoin();
    socket.on("connect", doJoin);

    const handleNew = (data) => {
      if (data.roomId !== chatId) return;
      setMessages((prev) => [
        ...prev,
        { sender: data.sender, content: data.text, timestamp: data.timestamp },
      ]);
      if (data.sender === "admin" && !isOpen) setHasUnread(true);
    };
    socket.on("new_message", handleNew);

    return () => {
      socket.off("new_message", handleNew);
      socket.off("connect", doJoin);
    };
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
    setInput("");
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

  useEffect(() => {
    const handleOpenRequest = (e) => {
      const requestedChatId = e.detail?.chatId;
      if (requestedChatId && chatId && requestedChatId !== chatId) return;
      setIsOpen(true);
      setHasUnread(false);
      if (chatId) markChatRead(chatId);
    };
    window.addEventListener("open-support-chat", handleOpenRequest);
    return () =>
      window.removeEventListener("open-support-chat", handleOpenRequest);
  }, [chatId, markChatRead]);

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-4 w-[360px] sm:w-[400px] h-[560px] bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden transition-all duration-300 ease-out transform scale-100 origin-bottom-right">
       
          <div className="flex items-center justify-between px-5 py-4 bg-black text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-end gap-1">
                  <Link href={"/"}>
                    <Image
                      src="/favicon.svg"
                      alt="logo"
                      width={30}
                      height={30}
                      loading="eager"
                    />
                  </Link>
                </div>
                <span className="absolute bottom-1 left-4 h-3 w-3 rounded-full bg-emerald-500 border-2 border-black" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide">
                  Payra Support
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-neutral-400">
                    We typically reply instantly
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={toggleOpen}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-neutral-50/50"
          >
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 text-[#ffb800] animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-neutral-400 px-6">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-[#ffb800] mb-3">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-neutral-800">
                  Start a Conversation
                </p>
                <p className="text-xs text-neutral-500 mt-1 max-w-60">
                  Ask us anything about sizing, shipping, or returns!
                </p>
              </div>
            ) : (
              messages.map((m, i) => {
                if (m.system) {
                  return (
                    <div key={i} className="flex justify-center my-2">
                      <p className="text-xs bg-neutral-200 text-neutral-600 px-3 py-1.5 rounded-full max-w-[85%] text-center">
                        {m.content}
                      </p>
                    </div>
                  );
                }

                const isUser = m.sender === "user";
                return (
                  <div
                    key={i}
                    className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mb-1">
                        <Image
                          src="/favico-light.svg"
                          alt="logo"
                          width={20}
                          height={20}
                          loading="eager"
                        />
                      </div>
                    )}
                    <div
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[75%]`}
                    >
                      <div
                        className={`px-4 py-2.5 text-[13px] leading-relaxed font-normal shadow-sm ${
                          isUser
                            ? "bg-[#ffb800] text-black rounded-[20px] rounded-br-[4px]"
                            : "bg-white text-neutral-800 border border-neutral-100 rounded-[20px] rounded-bl-[4px]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {m.content}
                        </p>
                      </div>
                      <span className="text-[10px] text-neutral-400 px-1 mt-1 font-medium">
                        {formatTime(m.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="px-4 py-3 border-t border-neutral-100 bg-white shrink-0">
            <div className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200/70 focus-within:!bg-white focus-within:ring-2 focus-within:ring-[#ffb800] focus-within:border-transparent border border-transparent rounded-2xl px-3 py-1.5 transition-all">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                className="flex-1 text-sm bg-transparent focus:outline-none py-1.5 text-neutral-800 placeholder-neutral-400"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-xl bg-black text-[#ffb800] disabled:bg-neutral-200 disabled:text-neutral-400 hover:bg-neutral-900 transition-all shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={toggleOpen}
        className="relative h-14 w-14 rounded-full bg-[#ffb800] text-black shadow-2xl flex items-center justify-center hover:bg-[#ffb800]/80 hover:text-white active:scale-95 transition-all duration-200 group "
      >
        {hasUnread && (
          <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-black animate-pulse" />
        )}
        {isOpen ? (
          <X className="h-5 w-5 text-white transition-transform group-hover:rotate-90 duration-200" />
        ) : (
          <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110 duration-200" />
        )}
      </button>
    </div>
  );
}
