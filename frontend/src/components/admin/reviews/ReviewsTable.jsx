"use client";
import { useState } from "react";
import { FiEye, FiFlag, FiShield, FiTrash2 } from "react-icons/fi";

function StarRating({ value, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24">
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill={n <= value ? "#f59e0b" : "#e5e7eb"}
            stroke={n <= value ? "#d97706" : "#d1d5db"}
            strokeWidth="0.5"
          />
        </svg>
      ))}
    </div>
  );
}

function ReportBadge({ count }) {
  if (!count) return null;
  return (
    <span className="flex items-center gap-1 px-2 w-20 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 ring-1 ring-rose-200">
      <FiFlag size={11} /> {count} report{count !== 1 ? "s" : ""}
    </span>
  );
}

function productThumb(product) {
  if (!product) return null;
  if (product.images?.length) {
    const first = product.images[0];
    return typeof first === "string" ? first : first?.url || null;
  }
  const colorWithImages = product.colors?.find((c) => c.images?.length > 0);
  return colorWithImages?.images?.[0]?.url || null;
}

function TruncatedText({ text, limit = 120 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text)
    return <span className="text-gray-400 italic text-xs">No text</span>;
  const short = text.length > limit && !expanded;
  return (
    <span className="text-xs text-gray-700 w-60!">
      {short ? `${text.slice(0, limit)}…` : text}
      {text.length > limit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="ml-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium focus:outline-none"
        >
          {expanded ? "show less" : "show more"}
        </button>
      )}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-4 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="h-3 w-28 bg-gray-200 rounded" />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3.5 w-3.5 bg-gray-200 rounded-sm" />
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="h-3 w-48 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <div className="h-7 w-16 bg-gray-200 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 bg-gray-200 rounded flex-shrink-0" />
        <div className="h-10 w-10 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="h-3 w-32 bg-gray-200 rounded" />
      </div>
      <div className="flex gap-0.5 pl-9">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-3.5 w-3.5 bg-gray-200 rounded-sm" />
        ))}
      </div>
      <div className="pl-9 space-y-1.5">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function RowActions({ review, onDelete, onViewDetail }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetail(review);
        }}
        title="View detail"
        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        <FiEye size={15} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(review);
        }}
        title="Delete"
        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
      >
        <FiTrash2 size={15} />
      </button>
    </div>
  );
}

function ReviewCard({
  review,
  selected,
  onSelect,
  onDelete,
  onViewDetail,
  mode,
}) {
  const thumb = productThumb(review.product);
  const initials = review.user?.name?.[0]?.toUpperCase() || "?";
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={`bg-white rounded-xl border transition-colors cursor-pointer ${selected ? "border-indigo-300 bg-indigo-50/30" : "border-gray-100 hover:border-gray-200"}`}
      onClick={() => onViewDetail(review)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(review._id)}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#CAEF96] cursor-pointer flex-shrink-0"
          />
          {thumb ? (
            <img
              src={thumb}
              alt={review.product?.name}
              className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {review.product?.name || "Unknown product"}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{date}</span>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-0.5 text-xs text-[#CAEF96] font-medium">
                  <FiShield size={11} /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2 pl-7">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {review.user?.profilePicture?.url ? (
                <img
                  src={review.user.profilePicture.url}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold bg-black text-balck">
                  {initials}
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-gray-700">
              {review.user?.name || "Unknown"}
            </span>
          </div>
          <StarRating value={review.rating} size={13} />
        </div>
        <div className="w-20 mb-3">
          <TruncatedText text={review.reviewText} limit={0} />
        </div>
        <div className="flex items-center justify-between pl-7">
          {mode === "reported" ? (
            <ReportBadge count={review.reportCount} />
          ) : (
            <span />
          )}
          <RowActions
            review={review}
            onDelete={onDelete}
            onViewDetail={onViewDetail}
          />
        </div>
      </div>
    </div>
  );
}

export default function ReviewsTable({
  reviews,
  loading,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onDelete,
  onViewDetail,
  mode = "all",
}) {
  const allSelected =
    reviews.length > 0 && reviews.every((r) => selectedIds.has(r._id));
  const someSelected =
    reviews.length > 0 && reviews.some((r) => selectedIds.has(r._id));
  console.log(reviews);

  if (!loading && reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 py-20 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">
          {mode === "reported" ? "No reported reviews" : "No reviews found"}
        </p>
        <p className="text-gray-400 text-sm mt-1">
          {mode === "reported"
            ? "Nothing needs attention right now"
            : "Try adjusting your filters"}
        </p>
      </div>
    );
  }

  const columns =
    mode === "reported"
      ? [
          "Product",
          "Customer",
          "Rating",
          "Review",
          "Reports",
          "Date",
          "Actions",
        ]
      : ["Product", "Customer", "Rating", "Review", "Date", "Actions"];

  const desktopTable = (
    <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 cursor-pointer"
                />
              </th>
              {columns.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              : reviews.map((review) => {
                  const thumb = productThumb(review.product);
                  const initials = review.user?.name?.[0]?.toUpperCase() || "?";
                  const date = new Date(review.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  );

                  return (
                    <tr
                      key={review._id}
                      className={`cursor-pointer transition-colors ${selectedIds.has(review._id) ? "bg-indigo-50/40" : "hover:bg-gray-50/60"}`}
                      onClick={() => onViewDetail(review)}
                    >
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(review._id)}
                          onChange={() => onSelectRow(review._id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#CAEF96] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0 max-w-[180px]">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {review.product?.name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0 max-w-[160px]">
                          <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                            {review.user?.profilePicture?.url ? (
                              <img
                                src={review.user.profilePicture.url}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-semibold">
                                {initials}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {review.user?.name || "Unknown"}
                            </p>
                            {review.verifiedPurchase && (
                              <span className="inline-flex items-center gap-0.5 text-xs text-[#6aae0a] font-medium">
                                <FiShield size={10} /> Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <StarRating value={review.rating} />
                          <span className="text-xs text-gray-500 font-medium">
                            {review.rating}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 w-20!">
                        <TruncatedText text={review.reviewText} limit={90} />
                      </td>
                      {mode === "reported" && (
                        <td className="px-7 py-3">
                          <ReportBadge count={review.reportCount} />
                        </td>
                      )}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{date}</span>
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RowActions
                          review={review}
                          onDelete={onDelete}
                          onViewDetail={onViewDetail}
                        />
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const mobileCards = (
    <div className="md:hidden space-y-3">
      {loading
        ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        : reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              mode={mode}
              selected={selectedIds.has(review._id)}
              onSelect={onSelectRow}
              onDelete={onDelete}
              onViewDetail={onViewDetail}
            />
          ))}
    </div>
  );

  return (
    <>
      {desktopTable}
      {mobileCards}
    </>
  );
}
