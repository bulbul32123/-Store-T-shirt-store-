const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export const adminReportsApi = {
  getOverview: (range) =>
    apiFetch(`/api/admin/reports/overview?range=${range}`),
  getAcquisition: (range) =>
    apiFetch(`/api/admin/reports/acquisition?range=${range}`),
  getRetention: (range) =>
    apiFetch(`/api/admin/reports/retention?range=${range}`),
  getSegments: () => apiFetch(`/api/admin/reports/segments`),
  getRevenue: (range) => apiFetch(`/api/admin/reports/revenue?range=${range}`),
  getTopProducts: (range) =>
    apiFetch(`/api/admin/reports/top-products?range=${range}`),
};
