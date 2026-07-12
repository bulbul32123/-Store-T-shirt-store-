"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { getSocket } from "@/lib/socket";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatThread({ chat, loading, online, onNewMessage }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat?.messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !chat?._id) return;
    const socket = getSocket();
    socket.emit("send_message", { roomId: chat._id, sender: "admin", text });
    onNewMessage({
      sender: "admin",
      content: text,
      timestamp: new Date().toISOString(),
    });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
        <MessageCircle className="h-10 w-10 mb-2" />
        <p className="text-sm">Select a conversation to start replying</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 bg-white flex-shrink-0">
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
          style={{ background: "#6366f1" }}
        >
          {chat.user?.avatar || chat.user?.profilePicture?.url ? (
            <img
              src={chat.user.avatar || chat.user.profilePicture.url}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            chat.user?.name?.[0]?.toUpperCase() || "?"
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {chat.user?.name || "Unknown"}
          </p>
          <p
            className={`text-xs flex items-center gap-1 ${online ? "text-green-600" : "text-gray-400"}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${online ? "bg-green-500" : "bg-gray-300"}`}
            />
            {online ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-2"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        ) : chat.messages?.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-8">
            No messages yet
          </p>
        ) : (
          chat.messages?.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[65%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.sender === "admin"
                    ? "bg-green-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                <p
                  className={`text-[10px] mt-1 ${m.sender === "admin" ? "text-green-100" : "text-gray-400"}`}
                >
                  {formatTime(m.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a reply…"
          className="flex-1 text-sm px-3.5 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
