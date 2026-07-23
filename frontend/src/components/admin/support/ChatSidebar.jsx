"use client";
import { ChevronLeft, ChevronRight, MoreVertical, Search } from "lucide-react";
import { useState } from "react";
import UserAvatar from "@/components/common/UserAvatar"; 

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function ChatSidebar({
  chats,
  activeId,
  onlineIds,
  onSelect,
  onClose,
  collapsed,
  onToggleCollapse,
}) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = chats.filter((c) =>
    c.user?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  if (collapsed) {
    return (
      <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col items-center py-3">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 mb-10"
        >
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
        {filtered.slice(0, 8).map((c) => (
          <button
            key={c._id}
            onClick={() => onSelect(c._id)}
            className="relative mb-2 transition-transform active:scale-95"
          >
            <UserAvatar user={c.user} /> {/* 👈 Reusable usage */}
            {onlineIds.has(c.user?._id) && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">Support Chats</h2>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer…"
            className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">
            No active chats
          </p>
        ) : (
          filtered.map((c) => {
            const online = onlineIds.has(c.user?._id);
            return (
              <div
                key={c._id}
                onClick={() => onSelect(c._id)}
                className={`relative flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${activeId === c._id ? "bg-blue-50" : ""}`}
              >
                <div className="relative flex-shrink-0">
                  <UserAvatar user={c.user} /> 
                  {online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {c.user?.name || "Unknown"}
                    </p>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">
                      {c.lastMessage ? timeAgo(c.lastMessage.timestamp) : ""}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {c.lastMessage
                      ? `${c.lastMessage.sender === "admin" ? "You: " : ""}${c.lastMessage.content}`
                      : "No messages yet"}
                  </p>
                </div>

                {c.unreadByAdmin > 0 && (
                  <span className="flex-shrink-0 h-5 min-w-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {c.unreadByAdmin}
                  </span>
                )}

                <div className="relative flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === c._id ? null : c._id);
                    }}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                  {menuOpenId === c._id && (
                    <div className="absolute right-0 top-7 z-10 w-32 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                          onClose(c._id);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        Close chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
