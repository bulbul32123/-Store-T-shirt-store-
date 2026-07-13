import { calculateFinalPrice, parseDiscount } from "@/helpers/price";

export default function PriceComponent({ product }) {
  const discountPercent = parseDiscount(product?.discount ?? 0);
  const finalPrice = calculateFinalPrice(
    product?.price ?? 0,
    product?.discount ?? 0,
  );

  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold">${finalPrice}</span>

      {discountPercent > 0 && (
        <>
          <span className="text-xs text-gray-400 line-through">
            ${product.price}
          </span>

          <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-medium text-red-600">
            {discountPercent}% OFF
          </span>
        </>
      )}
    </div>
  );
}
