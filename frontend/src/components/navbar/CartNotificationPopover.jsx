'use client';

import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useVisitPopup } from '@/context/VisitPopupContext';
import { getCartVisitMessage } from '@/utils/visitPopupMessages';
import VisitPopup from './VisitPopup';
import ShoppingCartIcon from '../layout/ShoppingCartIcon';

export default function CartNotificationPopover() {
    const { itemCount } = useCart();
    const { showCartPopup, cartItemCount, dismissCart } = useVisitPopup();
    console.log('showCartPopup:', showCartPopup);
    const msg = getCartVisitMessage(cartItemCount);

    return (
        <div className="relative">
            <Link href="/cart" aria-label="Cart" className="relative block hover:text-gray-500 transition-colors">
                <ShoppingCartIcon />
                {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#FF5A1F] text-white text-[10px] font-bold flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </Link>

            <AnimatePresence>
                {showCartPopup && (
                    <VisitPopup
                        key="cart-visit-popup"
                        icon={ShoppingCart}
                        headline={msg.headline}
                        message={msg.message}
                        cta={msg.cta}
                        href={msg.href}
                        onDismiss={dismissCart}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}