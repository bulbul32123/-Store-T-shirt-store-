'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Heart, ShoppingBag } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';
import { useCart } from '@/context/CartContext';
import { getWatchlistMood } from '@/utils/cartMood';
import { useRealtimeMood } from '@/hooks/useRealtimeMood';
import MoodBanner from '@/components/profile/MoodBanner';
import toast from 'react-hot-toast';

const HOUR = 60 * 60 * 1000;

export default function LivingWatchlistPanel() {
    const { items, updatedAt, removeFromWatchlist } = useWatchlist();
    const { addToCart } = useCart();
    const mood = useRealtimeMood(items, updatedAt, getWatchlistMood, true);
    const hoursSince = updatedAt ? (Date.now() - updatedAt) / HOUR : 0;
    const urgent = items.length > 0 && hoursSince > 24;


    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-[#E5E5E5] rounded-2xl">
                <Heart size={32} strokeWidth={1.5} className="text-[#6F6F6F] mb-4" />
                <h3 className="text-lg font-bold uppercase tracking-tight text-[#111] mb-1">{mood.headline}</h3>
                <p className="text-sm text-[#6F6F6F] max-w-xs mb-6">{mood.message}</p>
                <Link
                    href="/products"
                    className="rounded-full bg-[#111] text-white text-xs font-bold uppercase tracking-wide px-6 py-2.5 hover:bg-white hover:text-[#111] border border-[#111] transition-colors"
                >
                    Browse products
                </Link>
            </div>
        );
    }
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
    return (
        <div>
            <MoodBanner headline={mood.headline} message={mood.message} urgent={urgent} />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item) => (
                    <div key={item.watchlistId} className="relative border border-[#E5E5E5] rounded-2xl p-3">
                        <button
                            onClick={() => removeFromWatchlist(item.watchlistId)}
                            aria-label={`Remove ${item.name}`}
                            className="absolute top-4 right-4 z-10 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white"
                        >
                            <X size={14} />
                        </button>

                        <Link href={`/product/${item.productId}`}>
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#F5F5F5] mb-3">
                                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="200px" />
                            </div>
                        </Link>
                                        <p className="font-bold text-sm text-[#111] line-clamp-1 mb-1">{item.name}</p>
                         <p className="text-xs text-[#6F6F6F] mt-0.5 mb-1">
                                        {item.size && `Size: ${item.size}`}
                                        {item.color && (
                                            <span className="inline-flex items-center gap-1 ml-2">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full border border-[#E5E5E5] inline-block"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                            </span>
                                        )}
                                    </p>
                            <p className="text-sm text-[#111] font-bold mb-3">${item.price.toFixed(2)}</p>

                         
   
                        

                        <button
                            onClick={() => handleMoveToCart(item)}
                            className="w-full rounded-full bg-[#111] text-white text-xs font-bold uppercase tracking-wide py-2.5 flex items-center justify-center gap-2 hover:bg-white hover:text-[#111] border border-[#111] transition-colors"
                        >
                            <ShoppingBag size={14} />
                            Move to cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}