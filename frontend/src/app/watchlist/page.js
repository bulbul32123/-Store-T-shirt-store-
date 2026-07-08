'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

export default function WishlistPage() {
    const { items, removeFromWatchlist } = useWatchlist();
    const { addToCart } = useCart();

 const handleMoveToCart = (item) => {
    addToCart(
        {
            _id: item.productId,
            name: item.name,
            slug: item.slug,
            price: item.price,
            discount: item.discount || 0,

            images: [
                {
                    url: item.image,
                },
            ],
        },
        {
            size: item.size,
            color: item.color,
            quantity: 1,
        }
    );

    removeFromWatchlist(item.watchlistId);

    toast.success('Moved to cart');
};
    if (!items.length) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center border border-dashed border-gray-300 rounded-3xl py-24">
                    <Heart
                        size={40}
                        strokeWidth={1.5}
                        className="mx-auto mb-5 text-gray-400"
                    />

                    <h2 className="text-2xl font-bold mb-3">
                        Nothing saved yet
                    </h2>

                    <p className="text-gray-500 mb-8">
                        Tap the heart on products you love and they'll appear here.
                    </p>

                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center rounded-full bg-black text-white px-8 py-3 font-medium hover:opacity-90 transition"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full pl-5 pr-5 md:pl-10 md:pr-10 border-b border-gray-300 py-10">
            {/* Header */}
            <div >
                <h1 className="text-4xl font-bold tracking-tight">
                    Wishlist
                </h1>

                <p className="text-gray-500 mt-2">
                    {items.length} saved {items.length === 1 ? 'item' : 'items'}
                </p>
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
                {items.map((item) => (
                    <div
                        key={item.watchlistId}
                        className="group"
                    >
                        {/* Image */}
                        <div className="relative">
                            <Link href={`/product/${item.productId}`}>
                                <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            </Link>

                            {/* Remove */}
                            <button
                                onClick={() =>
                                    removeFromWatchlist(item.watchlistId)
                                }
                                className="absolute top-4 cursor-pointer right-4 bg-white rounded-full h-7 w-7 flex items-center justify-center shadow-sm"
                            >
                                 <X size={14} />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="mt-4">
                            <h3 className="font-semibold text-base line-clamp-2">
                                {item.name}
                            </h3>

                            <div className="text-sm text-gray-500 mt-1">
                                {item.size && (
                                    <span>
                                        Size: {item.size}
                                    </span>
                                )}

                                {item.color && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span>Color</span>

                                        <span
                                            className="h-3 w-3 rounded-full border"
                                            style={{
                                                backgroundColor: item.color,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <p className="font-bold text-lg mt-3">
                                ${Number(item.price).toFixed(2)}
                            </p>

                            <button
                                onClick={() => handleMoveToCart(item)}
                                className="w-full mt-4 rounded-full bg-black text-white py-3 font-medium flex items-center justify-center gap-2 hover:opacity-90 transition"
                            >
                                <ShoppingBag size={18} />
                                Move to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}