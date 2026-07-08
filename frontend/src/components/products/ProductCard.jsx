'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, GitCompare, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWatchlist } from '@/context/WatchlistContext';
import { useCompare } from '@/context/CompareContext';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { toggleWatchlist, isInWatchlist } = useWatchlist();
    const { toggleCompare, isInCompare } = useCompare();

    const discountPercent = Number(product.discount || 0);
    const hasDiscount = discountPercent > 0;
    const finalPrice = hasDiscount
        ? (product.price - (product.price * discountPercent) / 100).toFixed(2)
        : product.price.toFixed(2);

    const firstImage = product?.colors?.[0]?.images?.[0]?.url || product?.images?.[0] || '/placeholder-product.png';
    const uniqueColors = [...new Set(product?.colors?.map((c) => c.code) || [])];
    const saved = isInWatchlist(product._id);
    const compared = isInCompare(product._id);

    return (
        <div className="group relative bg-white">
            {/* Watchlist + compare overlay buttons */}
            <div className="absolute z-10 top-3 right-3 flex flex-col gap-2">
                <button
                    type="button"
                    aria-label="Add to watchlist"
                    onClick={() => toggleWatchlist(product)}
                    className="h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                >
                    <Heart size={16} className={saved ? 'fill-[#FF5A1F] text-[#FF5A1F]' : 'text-[#111]'} />
                </button>
                <button
                    type="button"
                    aria-label="Add to compare"
                    onClick={() => toggleCompare(product)}
                    className="h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                >
                    <GitCompare size={16} className={compared ? 'text-[#FF5A1F]' : 'text-[#111]'} />
                </button>
            </div>

            {/* Status badges */}
            <div className="absolute z-10 top-3 left-3 flex flex-col gap-1.5">
                {hasDiscount && (
                    <span className="text-white bg-red-500 py-1 px-2 rounded-full text-xs font-bold uppercase">Sale</span>
                )}
                {product.isFreeShipping && (
                    <span className="text-white bg-green-600 py-1 px-2 rounded-full text-xs font-bold uppercase">Free shipping</span>
                )}
            </div>

            <Link href={`/product/${product._id}`}>
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-[#F5F5F5]">
                    <Image
                        src={firstImage}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-300"
                        sizes="(max-width:768px) 50vw, 300px"
                    />
                </div>
            </Link>

            <p className="text-xs text-[#6F6F6F] mb-1">{product?.category?.name}</p>

            <Link href={`/product/${product._id}`}>
                <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-2 text-[#111] hover:underline">
                    {product.name}
                </h3>
            </Link>

            <div className="flex items-center gap-2 font-bold mb-2">
                <span className="text-base text-[#111]">${finalPrice}</span>
                {hasDiscount && (
                    <>
                        <span className="line-through text-sm text-[#6F6F6F]">${product.price}</span>
                        <span className="text-red-500 bg-red-100 py-0.5 px-2 rounded-full text-xs">{discountPercent}% OFF</span>
                    </>
                )}
            </div>

            {uniqueColors.length > 0 && (
                <div className="flex items-center gap-1 mb-3">
                    {uniqueColors.slice(0, 4).map((color) => (
                        <span key={color} className="w-3 h-3 rounded-full border border-[#E5E5E5]" style={{ backgroundColor: color }} />
                    ))}
                    {uniqueColors.length > 4 && <span className="text-xs text-[#6F6F6F]">+{uniqueColors.length - 4}</span>}
                </div>
            )}

            <button
                type="button"
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className="w-full rounded-full bg-[#111] text-white font-bold uppercase tracking-wide text-xs py-2.5 flex items-center justify-center gap-2 hover:bg-white hover:text-[#111] border border-[#111] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <ShoppingBag size={14} />
                {product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
            </button>
        </div>
    );
}