"use client";
import { ChevronRight, ChevronUp, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const PRICE_MIN = 0;
const PRICE_MAX = 300;

export default function ShopSidebar({
  categories,
  availableColors,
  filters,
  onChange,
  onApply,
}) {
  const [localPrice, setLocalPrice] = useState([
    filters.minPrice || PRICE_MIN,
    filters.maxPrice || PRICE_MAX,
  ]);

  useEffect(() => {
    setLocalPrice([
      filters.minPrice || PRICE_MIN,
      filters.maxPrice || PRICE_MAX,
    ]);
  }, [filters.minPrice, filters.maxPrice]);

  const toggleInList = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange(key, next);
  };

  return (
    <aside className="w-full lg:w-[280px] shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <SlidersHorizontal size={18} /> Filters
        </h2>
      </div>

      {/* Categories */}
      <div className="border-t py-4 space-y-1">
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() =>
              onChange("category", filters.category === cat._id ? "" : cat._id)
            }
            className={`w-full flex items-center justify-between px-1 py-1.5 text-sm rounded-lg transition-colors ${
              filters.category === cat._id
                ? "font-bold text-black"
                : "text-gray-600 hover:text-black"
            }`}
          >
            {cat.name}
            <ChevronRight size={14} className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* Price */}
      <div className="border-t py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Price</h3>
          <ChevronUp size={16} className="text-gray-400" />
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={localPrice[0]}
            min={PRICE_MIN}
            max={localPrice[1]}
            onChange={(e) =>
              setLocalPrice([Number(e.target.value), localPrice[1]])
            }
            onBlur={() => onChange("minPrice", localPrice[0])}
            className="w-full border rounded-lg px-2 py-1.5 text-sm"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            value={localPrice[1]}
            min={localPrice[0]}
            max={PRICE_MAX}
            onChange={(e) =>
              setLocalPrice([localPrice[0], Number(e.target.value)])
            }
            onBlur={() => onChange("maxPrice", localPrice[1])}
            className="w-full border rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* Colors */}
      {availableColors.length > 0 && (
        <div className="border-t py-4">
          <h3 className="font-bold text-sm mb-3">Colors</h3>
          <div className="flex flex-wrap gap-3">
            {availableColors.map((c) => {
              const selected = (filters.colors || []).includes(c.name);
              return (
                <button
                  key={c.name}
                  onClick={() => toggleInList("colors", c.name)}
                  title={c.name}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    selected
                      ? "ring-2 ring-offset-2 ring-black"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c.code }}
                >
                  {selected && <span className="text-white text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      <div className="border-t py-4">
        <h3 className="font-bold text-sm mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const selected = (filters.sizes || []).includes(size);
            return (
              <button
                key={size}
                onClick={() => toggleInList("sizes", size)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selected
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-700 hover:border-black"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
      {/* Rating */}
      {/* Rating */}
      <div className="border-t py-4">
        <h3 className="font-bold text-sm mb-3">Rating</h3>
        <div className="flex flex-col gap-1.5">
          {[4, 3, 2].map((r) => {
            // Create a clean boolean check
            const isSelected = Number(filters.minRating) === r;

            return (
              <button
                key={r}
                onClick={() => onChange("minRating", isSelected ? "" : r)}
                className={`text-left text-sm px-2 py-1.5 rounded transition-colors ${
                  isSelected
                    ? "font-bold text-black bg-gray-100" // Added a soft background so it stands out beautifully
                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
              >
                {"★".repeat(r)}
                {"☆".repeat(5 - r)} & up
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Status */}
      <div className="border-t py-4">
        <h3 className="font-bold text-sm mb-3">Product Status</h3>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.status === "featured"}
              onChange={() =>
                onChange(
                  "status",
                  filters.status === "featured" ? "" : "featured",
                )
              }
            />
            Featured
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!filters.sale}
              onChange={() => onChange("sale", !filters.sale)}
            />
            Sale
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.status === "popular"}
              onChange={() =>
                onChange(
                  "status",
                  filters.status === "popular" ? "" : "popular",
                )
              }
            />
            Popular
          </label>

          {/* ADDED: Trending Status */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.status === "trending"}
              onChange={() =>
                onChange(
                  "status",
                  filters.status === "trending" ? "" : "trending",
                )
              }
            />
            Trending
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.status === "newDrop"}
              onChange={() =>
                onChange(
                  "status",
                  filters.status === "newDrop" ? "" : "newDrop",
                )
              }
            />
            New Drop
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!filters.freeShipping}
              onChange={() => onChange("freeShipping", !filters.freeShipping)}
            />
            Free Shipping
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.status === "bestselling"}
              onChange={() =>
                onChange(
                  "status",
                  filters.status === "bestselling" ? "" : "bestselling",
                )
              }
            />
            Best Selling
          </label>
        </div>
      </div>
      <button
        onClick={() => {
          onChange("minPrice", localPrice[0]);
          onChange("maxPrice", localPrice[1]);
          onApply();
        }}
        className="w-full mt-4 bg-black text-white rounded-full py-3 text-sm font-semibold hover:bg-gray-800 transition-colors"
      >
        Apply Filter
      </button>
    </aside>
  );
}
