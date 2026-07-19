"use client";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product, status, isLoading = false }) {
  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="inline-block w-[300px] bg-white p-1 animate-pulse">
        {/* Image Skeleton */}
        <div className="relative w-full h-[19rem] rounded-2xl bg-gray-200 mb-3" />
        {/* Category Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
        {/* Title Skeleton */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
        {/* Price Skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
        {/* Color Variants Skeleton */}
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          <div className="w-3 h-3 rounded-full bg-gray-200" />
        </div>
      </div>
    );
  }

  // Actual Product Card Logic
  const discountPercent = Number(product?.discount || 0);
  const finalPrice =
    discountPercent > 0
      ? (
          Number(product.price || 0) -
          (Number(product.price || 0) * discountPercent) / 100
        ).toFixed(2)
      : Number(product.price || 0).toFixed(2);

  const firstImage =
    product?.colors?.[0]?.images?.[0]?.url ||
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    "/placeholder-product.png";

  const uniqueColors = [
    ...new Set(product?.colors?.map((color) => color.code) || []),
  ];

  const hasDiscount = discountPercent > 0;

  return (
    <Link href={`/product/${product?._id}?${product.slug}`} className="inline-block w-[300px]">
      <div className="bg-white p-1 relative">
        {hasDiscount && (
          <span className="absolute z-10 top-4 left-3 text-black bg-primary py-1 px-2 rounded-full text-xs">
            Sale
          </span>
        )}
        {status === "newDrop" && (
          <span className="absolute z-10 top-4 left-3 text-white bg-black py-1 px-2 rounded-full text-xs">
            New
          </span>
        )}
        {product?.isFreeShipping && (
          <span className="absolute z-10 top-4 right-3 text-white bg-green-600 py-1 px-2 rounded-full text-xs">
            Free Shipping
          </span>
        )}
        <div className="relative w-full h-[19rem] rounded-2xl overflow-hidden mb-3">
          <Image
            src={firstImage}
            alt={product?.name || "Product"}
            fill
            unoptimized={firstImage?.endsWith(".avif")}
            className="object-cover object-center"
            sizes="(max-width:768px) 100vw, 300px"
          />
        </div>
        <p className="text-xs text-muted-foreground mb-1">
          {product?.category?.name || product?.category}
        </p>
        <h3 className="font-extrabold text-sm md:text-lg mb-1 line-clamp-2">
          {product?.name}
        </h3>
        <div className="flex items-center gap-2 font-bold">
          <span className="text-lg">${finalPrice}</span>
          {hasDiscount && (
            <>
              <span className="line-through text-sm text-gray-400">
                ${product.price}
              </span>
              <span className="text-black bg-primary px-2 rounded-full text-xs">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 mt-2">
          {uniqueColors.slice(0, 4).map((color) => (
            <span
              key={color}
              className="w-3 h-3 rounded-full border border-border"
              style={{ backgroundColor: color }}
            />
          ))}
          {uniqueColors.length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{uniqueColors.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
