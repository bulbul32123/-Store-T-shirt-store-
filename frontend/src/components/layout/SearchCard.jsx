import Image from "next/image";
import Link from "next/link";
import PriceComponent from "./PriceComponent";

export default function SearchCard({ item }) {
  const image = item?.colors?.[0]?.images?.[0]?.url || "/placeholder.png";

  return (
    <Link
      href={`/product/${item._id}`}
      className="flex gap-3 rounded-lg p-2 hover:bg-gray-100 transition"
    >
      {/* Product Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image src={image} alt={item.name} fill className="object-cover" />
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col justify-between py-1">
        {/* Status */}
        <div className="flex flex-wrap gap-2">
          {item.newDrop && (
            <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[7px] text-white">
             New
            </span>
          )}{" "}
          {item.isFreeShipping && (
            <span className="rounded-full bg-green-600 px-2 py-0.5 text-[7px] text-white">
              Free Shipping
            </span>
          )}
        </div>

        {/* Category */}
        <p className="text-xs text-gray-500">{item.category?.name}</p>

        {/* Name */}
        <h3 className="line-clamp-1 text-sm font-semibold">{item.name}</h3>

        {/* Price */}
        <PriceComponent product={item} />

        {/* Colors */}
        <div className="flex items-center gap-2 mt-1">
          {item.colors?.map((color) => (
            <span
              key={color._id}
              className="h-4 w-4 rounded-full border border-gray-300"
              style={{ backgroundColor: color.code }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
