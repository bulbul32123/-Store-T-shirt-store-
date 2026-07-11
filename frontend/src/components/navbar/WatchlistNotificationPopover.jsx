'use client';

import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';
import { useVisitPopup } from '@/context/VisitPopupContext';
import { getWatchlistVisitMessage } from '@/utils/visitPopupMessages';
import VisitPopup from './VisitPopup';
import FavouriteIcon from '../layout/FavouriteIcon';

export default function WatchlistNotificationPopover() {
    const { itemCount } = useWatchlist();
    const { showWatchlistPopup, watchlistItemCount, dismissWatchlist } = useVisitPopup();
    console.log('showWatchlistPopup:', showWatchlistPopup);
    const msg = getWatchlistVisitMessage(watchlistItemCount);

    return (
        <div className="relative">
            <Link href="/profile/watchlist" aria-label="Watchlist" className="relative block hover:text-gray-500 transition-colors">
                <FavouriteIcon />
                {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#FF5A1F] text-white text-[10px] font-bold flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </Link>

            <AnimatePresence>
                {showWatchlistPopup && (
                    <VisitPopup
                        key="watchlist-visit-popup"
                        icon={Heart}
                        headline={msg.headline}
                        message={msg.message}
                        cta={msg.cta}
                        href={msg.href}
                        onDismiss={dismissWatchlist}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}