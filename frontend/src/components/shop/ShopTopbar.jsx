"use client";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "", label: "Most Recent" },
  { value: "price:asc", label: "Price: Low to High" },
  { value: "price:desc", label: "Price: High to Low" },
  { value: "rating:desc", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

export default function ShopTopbar({ title, total, sort, onSortChange }) {
  return (
    <div className="mb-6">
      <div className="text-sm text-gray-400 mb-3 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>›</span>
        <span className="text-black">{title}</span>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold">{title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>
            Showing {total > 0 ? "1" : "0"}-{Math.min(total, 10)} of {total}{" "}
            Products
          </span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-transparent pl-2 pr-6 py-1 text-sm font-medium text-black cursor-pointer focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
