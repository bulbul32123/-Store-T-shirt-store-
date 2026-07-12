"use client";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Hash,
  Loader2,
  Check,
} from "lucide-react";
import { adminChatApi } from "@/lib/adminChatApi";

export default function CustomerPanel({ chat, collapsed, onToggleCollapse }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNote("");
  }, [chat?._id]);

  if (collapsed) {
    return (
      <div className="w-12 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col items-center py-3">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white flex items-center justify-center">
        <p className="text-sm text-gray-400 px-4 text-center">
          No customer selected
        </p>
      </div>
    );
  }

  const u = chat.user || {};
  const addr = u.address;

  const saveNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await adminChatApi.addNote(chat._id, note.trim());
      setNote("");
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Customer Details</h3>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="flex flex-col items-center py-5 border-b border-gray-100">
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-semibold text-white mb-2"
          style={{ background: "#6366f1" }}
        >
          {u.avatar || u.profilePicture?.url ? (
            <img
              src={u.avatar || u.profilePicture.url}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            u.name?.[0]?.toUpperCase() || "?"
          )}
        </div>
        <p className="text-sm font-semibold text-gray-900">
          {u.name || "Unknown"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Storefront customer</p>
      </div>

      <div className="px-4 py-4 space-y-3.5 border-b border-gray-100">
        <div className="flex items-start gap-2.5">
          <Hash className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              Customer ID
            </p>
            <p className="text-xs text-gray-700 break-all">{u._id}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Mail className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              Email
            </p>
            <p className="text-xs text-gray-700 break-all">{u.email || "—"}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Phone className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              Phone
            </p>
            <p className="text-xs text-gray-700">{u.phone || "—"}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              Address
            </p>
            <p className="text-xs text-gray-700">
              {addr?.street
                ? `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`
                : "Not provided"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex-1">
        <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-2">
          Internal Notes
        </p>
        {u.notes?.length > 0 && (
          <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
            {u.notes
              .slice()
              .reverse()
              .map((n, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-700">{n.text}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {n.addedBy} · {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        )}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Add a note about this customer…"
          className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button
          onClick={saveNote}
          disabled={saving || !note.trim()}
          className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : saved ? (
            <Check className="h-3.5 w-3.5" />
          ) : null}
          {saving ? "Saving…" : saved ? "Saved" : "Add Note"}
        </button>
      </div>
    </div>
  );
}
