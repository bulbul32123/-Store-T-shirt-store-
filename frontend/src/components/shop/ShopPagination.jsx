"use client";

export default function ShopPagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  const delta = 2;
  const range = [];
  for (
    let i = Math.max(1, page - delta);
    i <= Math.min(pages, page + delta);
    i++
  )
    range.push(i);

  return (
    <div className="flex items-center justify-between mt-10">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1.5 px-4 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        ← Previous
      </button>
      <div className="flex items-center gap-1">
        {range[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-9 h-9 rounded-lg text-sm hover:bg-gray-100"
            >
              1
            </button>
            {range[0] > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}
        {range.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-black text-white" : "hover:bg-gray-100"}`}
          >
            {p}
          </button>
        ))}
        {range[range.length - 1] < pages && (
          <>
            {range[range.length - 1] < pages - 1 && (
              <span className="px-1 text-gray-400">…</span>
            )}
            <button
              onClick={() => onPageChange(pages)}
              className="w-9 h-9 rounded-lg text-sm hover:bg-gray-100"
            >
              {pages}
            </button>
          </>
        )}
      </div>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="flex items-center gap-1.5 px-4 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
