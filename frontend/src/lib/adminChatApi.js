
// src/lib/adminChatApi.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export const adminChatApi = {
  getChats: () => apiFetch("/api/admin/chats"),
  getChatById: (id) => apiFetch(`/api/admin/chats/${id}`),
  addNote: (id, note) =>
    apiFetch(`/api/admin/chats/${id}/notes`, {
      method: "PATCH",
      body: JSON.stringify({ note }),
    }),
  closeChat: (id) => apiFetch(`/api/admin/chats/${id}`, { method: "DELETE" }),
};
