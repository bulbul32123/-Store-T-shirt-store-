'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';

export default function CompareBar() {
    const { items, removeFromCompare, clearCompare } = useCompare();
    const router = useRouter();

    if (items.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E5E5] shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 overflow-x-auto">
                <span className="text-xs font-bold uppercase tracking-wide text-[#6F6F6F] shrink-0">
                    Compare ({items.length})
                </span>

                <div className="flex gap-2 shrink-0">
                    {items.map((p) => (
                        <span
                            key={p._id}
                            className="flex items-center gap-1.5 bg-[#F5F5F5] rounded-full pl-3 pr-1.5 py-1 text-xs font-medium text-[#111] whitespace-nowrap"
                        >
                            {p.name}
                            <button onClick={() => removeFromCompare(p._id)} aria-label={`Remove ${p.name}`}>
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>

                <div className="ml-auto flex items-center gap-3 shrink-0">
                    <button onClick={clearCompare} className="text-xs text-[#6F6F6F] hover:text-[#111] underline">
                        Clear
                    </button>
                    <button
                        onClick={() => router.push('/compare')}
                        disabled={items.length < 2}
                        className="rounded-full bg-[#111] text-white text-xs font-bold uppercase tracking-wide px-5 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Compare now
                    </button>
                </div>
            </div>
        </div>
    );
}