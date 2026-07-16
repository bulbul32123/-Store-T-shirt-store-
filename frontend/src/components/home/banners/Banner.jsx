import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Banner({ banner, isLoading = false }) {
  if (isLoading || !banner) {
    return (
      <div className="relative w-full h-[600px] overflow-hidden mt-9 mb-10 rounded-xl animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-48 mb-4" />
        <div className="w-full h-full bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const product = banner.product;
  const badges = [];
  if (banner.showStatus) {
    if (product?.newDrop) badges.push("New");
    if (product?.isFreeShipping) badges.push("Free Shipping");
    if (product?.discount > 0) badges.push("Sale");
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden mt-9 mb-10 rounded-xl">
      <h2 className={`text-4xl pb-4 font-extrabold text-black`}>Don't Miss</h2>
      <Link
        href={`/product/${product?._id}`}
        className="block w-full h-full relative"
      >
        <Image
          src={banner.image?.url}
          alt={banner.title || product?.name || "Banner"}
          fill
          className="object-cover object-center rounded-xl"
        />
        {badges.length > 0 && (
          <div className="absolute top-6 left-6 flex gap-2 z-10">
            {badges.map((b) => (
              <span
                key={b}
                className="bg-black text-white text-xs font-medium px-3 py-1 rounded-full"
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </Link>
    </div>
  );
}
