// src/components/profile/cart/LivingCartPanel.jsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getCartMood } from '@/utils/cartMood';
import { useRealtimeMood } from '@/hooks/useRealtimeMood';
import MoodBanner from '@/components/profile/MoodBanner';

const HOUR = 60 * 60 * 1000;

export default function LivingCartPanel() {
    const { items, subtotal, updatedAt, updateQuantity, removeFromCart } = useCart();
    const mood = useRealtimeMood(items, updatedAt, getCartMood, false);
    const hoursSince = updatedAt ? (Date.now() - updatedAt) / HOUR : 0;
    const urgent = items.length > 0 && hoursSince > 2;

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-[#E5E5E5] rounded-2xl">
                <ShoppingBag size={32} strokeWidth={1.5} className="text-[#6F6F6F] mb-4" />
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

    return (
        <div>
            <MoodBanner headline={mood.headline} message={mood.message} urgent={urgent} />

            <div className="divide-y divide-[#E5E5E5]">
                {items.map((item) => (
                    <div key={item.lineId} className="flex gap-4 py-5">
                        <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-[#F5F5F5] shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-bold text-sm text-[#111] line-clamp-1">{item.name}</p>
                                    <p className="text-xs text-[#6F6F6F] mt-0.5">
                                        {item.size && `Size ${item.size}`}
                                        {item.color && (
                                            <span className="inline-flex items-center gap-1 ml-2">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full border border-[#E5E5E5] inline-block"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.lineId)}
                                    aria-label={`Remove ${item.name}`}
                                    className="text-[#6F6F6F] hover:text-[#111] shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-3 border border-[#E5E5E5] rounded-full px-1 py-1">
                                    <button
                                        onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                                        aria-label="Decrease quantity"
                                        className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-[#F5F5F5]"
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                                        aria-label="Increase quantity"
                                        className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-[#F5F5F5]"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                                <span className="font-bold text-sm text-[#111]">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-[#E5E5E5] pt-6 mt-2 flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-widest text-[#6F6F6F]">Subtotal</p>
                    <p className="text-xl font-bold text-[#111]">${subtotal.toFixed(2)}</p>
                </div>
                <button
                    type="button"
                    disabled
                    title="Checkout is coming soon"
                    className="rounded-full bg-[#111]/40 cursor-not-allowed text-white font-bold uppercase tracking-wide px-8 h-11"
                >
                    Checkout
                </button>
            </div>
            <p className="text-xs text-[#6F6F6F] text-right mt-2">Checkout opens once order processing is live.</p>
        </div>
    );
}