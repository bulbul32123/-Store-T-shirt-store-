"use client";
import Link from "next/link";
import { FiAlertTriangle, FiPackage } from "react-icons/fi";

export default function LowStockCard({ products = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-6">
      <h2 className="text-lg font-bold text-[#18181B] mb-5">
        Low Stock Products
      </h2>

      {!products.length ? (
        <div className="text-center py-10">
          <FiAlertTriangle size={28} className="mx-auto text-[#D4D4D8] mb-2" />
          <p className="text-sm text-[#71717A]">
            All products are well stocked
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => {
            const imageObj = product.images?.[0];
            const imageUrl =
              typeof imageObj === "object" ? imageObj?.url : imageObj;

            return (
              <Link
                key={product._id}
                href={`/admin/products/edit/${product._id}`}
                className="flex justify-between items-center p-3 rounded-xl hover:bg-[#FAFAF9] transition-colors cursor-pointer group border border-transparent hover:border-black/5"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
         
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-black/5 shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <FiPackage className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm text-[#18181B] group-hover:text-blue-600 transition-colors truncate block">
                      {product.name}
                    </span>
                    {product.category && (
                      <p className="text-xs text-[#71717A] mt-0.5">
                        {product.category.name}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                  style={{
                    backgroundColor: product.stock <= 5 ? "#FEF2F3" : "#FFFBEA",
                    color: product.stock <= 5 ? "#DC2626" : "#B45309",
                  }}
                >
                  {product.stock} left
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
