 'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';

// Presentational popup for cart reminders. Hovering pauses auto-close via callbacks.
export default function CartReminderPopup({ stage, onClose, onCTA, onMouseEnter, onMouseLeave }) {
    const router = useRouter();
    const rootRef = useRef(null);

    if (!stage) return null;

    const handleCTA = (e) => {
        e.stopPropagation();
        if (onCTA) onCTA();
        router.push('/cart');
    };

    return (
        <div
            ref={rootRef}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-4 z-50 transform transition-all duration-300 scale-100 opacity-100"
            role="dialog"
            aria-live="polite"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-start justify-between mb-2">
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-600">Cart Reminder</div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">✕</button>
            </div>

            <h4 className="font-semibold text-sm text-gray-900 mb-1">{stage.headline}</h4>
            <p className="text-xs text-gray-600 mb-3">{stage.message}</p>

            <div className="flex justify-end">
                <button
                    onClick={handleCTA}
                    className="bg-black text-white text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full shadow-sm hover:opacity-95"
                >
                    {stage.cta}
                </button>
            </div>
        </div>
    );
}
