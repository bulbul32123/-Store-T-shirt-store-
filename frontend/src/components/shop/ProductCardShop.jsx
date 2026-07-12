"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductCardShop({ product, status, selectedFilters = [] }) {
  const discountPercent = Number(product?.discount || 0);
  const finalPrice =
    discountPercent > 0
      ? (
          Number(product.price || 0) -
          (Number(product.price || 0) * discountPercent) / 100
        ).toFixed(2)
      : Number(product.price || 0).toFixed(2);

  const getInitialColorIndex = () => {
    if (!selectedFilters?.length) return 0;

    const index = (product.colors || []).findIndex((color) =>
      selectedFilters.some((c) => c.toLowerCase() === color.name.toLowerCase()),
    );

    return index >= 0 ? index : 0;
  };

  const [selectedColorIdx, setSelectedColorIdx] = useState(
    getInitialColorIndex(),
  );
  useEffect(() => {
    setSelectedColorIdx(getInitialColorIndex());
  }, [selectedFilters, product]);
  const colors = product?.colors || [];
  const activeColor = colors[selectedColorIdx];

  const displayImage =
    activeColor?.images?.[0]?.url ||
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    "/placeholder-product.png";

  const hasDiscount = discountPercent > 0;

  return (
    <div className="w-full">
      <Link href={`/product/${product?._id}`} className="block">
        <div className="bg-white p-1 relative">
          <div className="absolute z-10 top-4 left-3 flex flex-col gap-5 items-start">
          {hasDiscount && (
            <span className="text-black bg-primary py-1 px-2 rounded-full text-xs font-semibold">
              Sale
            </span>
          )}
          {product.newDrop && (
            <span className="text-white bg-black py-1 px-2 rounded-full text-xs font-semibold">
              New
            </span>
          )}
        </div>

        {/* Right Badge */}
        {product?.isFreeShipping && (
          <span className="absolute z-10 top-4 right-3 text-white bg-green-600 py-1 px-2 rounded-full text-xs font-semibold">
            Free Shipping
          </span>
        )}

          <div className="relative w-full h-[19rem] rounded-2xl overflow-hidden mb-3">
            <Image
              src={displayImage}
              alt={product?.name || "Product"}
              fill
              className="object-cover object-center transition-opacity duration-200"
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
        </div>
      </Link>

      {/* Color swatches — click to swap displayed image. Kept outside the <Link> so clicks don't navigate. */}
      {colors.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2 px-1">
          {colors.slice(0, 6).map((color, idx) => (
            <button
              key={color.name + idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedColorIdx(idx);
              }}
              title={color.name}
              className={`w-4 h-4 rounded-full border transition-all ${
                idx === selectedColorIdx
                  ? "ring-2 ring-offset-1 ring-black border-transparent"
                  : "border-gray-300"
              }`}
              style={{ backgroundColor: color.code }}
            />
          ))}
          {colors.length > 6 && (
            <span className="text-xs text-muted-foreground ml-0.5">
              +{colors.length - 6}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
