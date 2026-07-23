
 'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import ShoppingCartIcon from './ShoppingCartIcon';
import useCartReminder from '@/hooks/useCartReminder';
import CartReminderPopup from '@/components/navbar/CartReminderPopup';

export default function CartNotificationPopover() {
    const { items, itemCount, updatedAt } = useCart();

    const containerRef = useRef(null);

    const { visible, stage, pauseAutoClose, resumeAutoClose, resetHistory, onManualClose } = useCartReminder(items, updatedAt);

    useEffect(() => {
        if (!items || items.length === 0) {
            resetHistory();
        }
    }, [items, resetHistory]);

    useEffect(() => {
        if (!visible) return;
        const onDoc = (e) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target)) {
                onManualClose();
            }
        };
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, [visible, onManualClose]);

    return (
        <div ref={containerRef} className="relative inline-block">
            <Link href="/cart" aria-label="Cart" className="relative cursor-pointer hover:text-gray-500 transition-colors block">
                <ShoppingCartIcon />
                {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-black text-[10px] font-bold flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </Link>

            {visible && stage && (
                <div className="absolute right-0 top-full">
                    <CartReminderPopup
                        stage={stage}
                        onClose={onManualClose}
                        onCTA={onManualClose}
                        onMouseEnter={pauseAutoClose}
                        onMouseLeave={resumeAutoClose}
                    />
                </div>
            )}
        </div>
    );
}