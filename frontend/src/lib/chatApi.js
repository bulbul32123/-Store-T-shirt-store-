// src/lib/chatApi.js
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
export const chatApi = {
  getMyChat: () => apiFetch("/api/chats/me"),
};

