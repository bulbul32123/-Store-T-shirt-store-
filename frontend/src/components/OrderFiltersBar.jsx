"use client";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "archive", label: "Archive Orders" }, // Match value conventions
];

export default function OrderFiltersBar({
  filters,
  updateFilters,
  resetFilters,
}) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      updateFilters({ search: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleReset = () => {
    setSearchInput("");
    resetFilters();
  };

  // Determine active tab state explicitly
  const currentTab = filters.archived ? "archive" : filters.status || "all";

  const handleTabChange = (tabValue) => {
    if (tabValue === "archive") {
      updateFilters({ archived: true, status: "all" });
    } else {
      updateFilters({ archived: false, status: tabValue });
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white rounded-t-xl px-4 pt-3">
      {/* Status tabs - Now including Archive */}
      <div className="flex gap-1 overflow-x-auto -mb-px">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              currentTab === tab.value
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inputs Bar (Archive button completely removed) */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 py-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search order #, customer name, or email…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => updateFilters({ startDate: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Start date"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => updateFilters({ endDate: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="End date"
          />
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
          Reset filters
        </button>
      </div>
    </div>
  );
}
