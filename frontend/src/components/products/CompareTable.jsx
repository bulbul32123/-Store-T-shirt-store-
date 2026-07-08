'use client';

import Image from 'next/image';
import { useCompare } from '@/context/CompareContext';

const ROWS = [
    { label: 'Price', render: (p) => `$${p.price.toFixed(2)}` },
    { label: 'Discount', render: (p) => (p.discount ? `${p.discount}% off` : '—') },
    { label: 'Rating', render: (p) => (p.averageRating ? `${p.averageRating.toFixed(1)} (${p.numReviews})` : 'No ratings yet') },
    { label: 'Sizes', render: (p) => p.sizes?.join(', ') || '—' },
    { label: 'Colors', render: (p) => p.colors?.map((c) => c.name).join(', ') || '—' },
    { label: 'Stock', render: (p) => (p.stock > 0 ? `${p.stock} available` : 'Out of stock') },
    { label: 'Free shipping', render: (p) => (p.isFreeShipping ? 'Yes' : 'No') },
];

export default function CompareTable() {
    const { items } = useCompare();

    if (items.length < 2) {
        return (
            <div className="text-center py-20 text-[#6F6F6F]">
                Add at least 2 products to compare.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <div
                className="grid min-w-[640px]"
                style={{ gridTemplateColumns: `160px repeat(${items.length}, minmax(180px, 1fr))` }}
            >
                {/* Header row: images + names */}
                <div />
                {items.map((p) => {
                    const image = p.colors?.[0]?.images?.[0]?.url || p.images?.[0] || '/placeholder-product.png';
                    return (
                        <div key={p._id} className="flex flex-col items-center text-center px-3 pb-4">
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#F5F5F5] mb-2">
                                <Image src={image} alt={p.name} fill className="object-cover" sizes="180px" />
                            </div>
                            <p className="font-bold text-sm text-[#111]">{p.name}</p>
                        </div>
                    );
                })}

                {/* Spec rows */}
                {ROWS.map((row, i) => (
                    <>
                        <div
                            key={`label-${row.label}`}
                            className={`text-xs font-bold uppercase tracking-wide text-[#6F6F6F] py-3 px-3 ${i % 2 ? 'bg-[#F5F5F5]' : ''}`}
                        >
                            {row.label}
                        </div>
                        {items.map((p) => (
                            <div
                                key={`${row.label}-${p._id}`}
                                className={`text-sm text-[#111] py-3 px-3 text-center ${i % 2 ? 'bg-[#F5F5F5]' : ''}`}
                            >
                                {row.render(p)}
                            </div>
                        ))}
                    </>
                ))}
            </div>
        </div>
    );
}