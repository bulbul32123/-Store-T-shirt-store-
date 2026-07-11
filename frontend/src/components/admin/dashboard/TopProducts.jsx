'use client';
import Image from 'next/image';

export default function TopProducts({ products = [] }) {
    return (
        <div className="bg-white rounded-2xl border border-black/5 p-6">
            <h2 className="text-lg font-bold text-[#18181B] mb-1">Top Products</h2>
            <p className="text-sm text-[#71717A] mb-5">Ranked by revenue</p>

            {!products.length ? (
                <div className="py-10 text-center">
                    <p className="text-sm text-[#71717A]">No sales data yet.</p>
                </div>
            ) : (
                <ul className="space-y-1">
                    {products.map((p, i) => (
                        <li key={p._id} className="flex items-center gap-4 py-3 border-b border-black/5 last:border-0">
                            <span className="text-sm font-bold text-[#A1A1AA] w-5 shrink-0">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-[#FAFAF9] shrink-0">
                                {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#18181B] truncate">{p.name}</p>
                                <p className="text-xs text-[#71717A]">{p.unitsSold} units sold</p>
                            </div>
                            <span className="text-sm font-bold text-[#16A34A] shrink-0">
                                ${p.revenue.toFixed(2)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}