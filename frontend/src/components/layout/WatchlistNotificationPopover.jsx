'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWatchlist } from '@/context/WatchlistContext';
import { getWatchlistMood } from '@/utils/cartMood';
import FavouriteIcon from './FavouriteIcon';
import { X } from 'lucide-react';

const HOUR = 60 * 60 * 1000;

const TIMINGS = {
    normal: {
        EMPTY: 30 * 60 * 1000,          
        SAVED: 5 * 60 * 1000,           
        WAITING_A_DAY: 24 * HOUR,       
    },
    test: {
        EMPTY: 15 * 1000,                
        SAVED: 10 * 1000,                
        WAITING_A_DAY: 30 * 1000,        
    }
};

function getNextWatchlistPopupTrigger(items, updatedAt, lastShown, isTestMode) {
    const config = isTestMode ? TIMINGS.test : TIMINGS.normal;
    
    if (items.length === 0) {
        const sessionStartStr = localStorage.getItem('site_session_start');
        if (!sessionStartStr) return { stateToShow: null, triggerTime: null };
        const sessionStart = Number(sessionStartStr);
        const triggerTime = sessionStart + config.EMPTY;

        if (
            lastShown &&
            lastShown.state === 'empty' &&
            lastShown.timestamp === sessionStart
        ) {
            return { stateToShow: null, triggerTime: null };
        }

        return { stateToShow: 'empty', triggerTime };
    }

    if (!updatedAt) return { stateToShow: null, triggerTime: null };

    const isNewWatchlistState = !lastShown || lastShown.updatedAt !== updatedAt;
    const savedTrigger = updatedAt + config.SAVED;
    if (isNewWatchlistState) {
        return { stateToShow: 'saved_for_later', triggerTime: savedTrigger };
    }
    const waitingTrigger = updatedAt + config.WAITING_A_DAY;
    if (lastShown.state === 'saved_for_later') {
        return { stateToShow: 'waiting_a_day', triggerTime: waitingTrigger };
    }

    return { stateToShow: null, triggerTime: null };
}

export default function WatchlistNotificationPopover() {
    const { items, itemCount, updatedAt } = useWatchlist();
    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    
    const [lastShownState, setLastShownState] = useState(null);

    const activeTimeoutRef = useRef(null);
    const autoCloseTimeoutRef = useRef(null);

    useEffect(() => {
        setHydrated(true);
        try {
            const raw = localStorage.getItem('watchlist_popup_last_shown');
            if (raw) {
                setLastShownState(JSON.parse(raw));
            }
        } catch (e) {
           
        }
    }, []);

    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'watchlist_popup_last_shown') {
                try {
                    const val = JSON.parse(e.newValue);
                    setLastShownState(val);
                } catch (err) {}
            }
            if (e.key === 'watchlist_popup_action' && e.newValue && e.newValue.startsWith('close-')) {
                setShowPopup(false);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    
    useEffect(() => {
        if (!hydrated) return;

        const isTestMode = localStorage.getItem('cart_popup_test_mode') === 'true';
        const { stateToShow, triggerTime } = getNextWatchlistPopupTrigger(items, updatedAt, lastShownState, isTestMode);

        if (!stateToShow || !triggerTime) {
            if (activeTimeoutRef.current) {
                clearTimeout(activeTimeoutRef.current.id);
                activeTimeoutRef.current = null;
            }
            return;
        }

        
        if (
            activeTimeoutRef.current &&
            activeTimeoutRef.current.state === stateToShow &&
            activeTimeoutRef.current.triggerTime === triggerTime
        ) {
            return;
        }

        
        if (activeTimeoutRef.current) {
            clearTimeout(activeTimeoutRef.current.id);
        }

        const delay = Math.max(0, triggerTime - Date.now());

        const id = setTimeout(() => {
            setShowPopup(true);
            const sessionStartStr = localStorage.getItem('site_session_start');
            const newShown = {
                state: stateToShow,
                updatedAt: items.length > 0 ? updatedAt : null,
                timestamp: items.length === 0 ? (sessionStartStr ? Number(sessionStartStr) : Date.now()) : null
            };
            localStorage.setItem('watchlist_popup_last_shown', JSON.stringify(newShown));
            setLastShownState(newShown);

            
            if (autoCloseTimeoutRef.current) {
                clearTimeout(autoCloseTimeoutRef.current);
            }
            autoCloseTimeoutRef.current = setTimeout(() => {
                setShowPopup(false);
                localStorage.setItem('watchlist_popup_action', 'close-' + Date.now());
            }, 5000);

        }, delay);

        activeTimeoutRef.current = { id, state: stateToShow, triggerTime };

        return () => {
            if (activeTimeoutRef.current) {
                clearTimeout(activeTimeoutRef.current.id);
            }
        };
    }, [items, updatedAt, hydrated, lastShownState]);

    
    useEffect(() => {
        return () => {
            if (autoCloseTimeoutRef.current) {
                clearTimeout(autoCloseTimeoutRef.current);
            }
        };
    }, []);

    const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowPopup(false);
        localStorage.setItem('watchlist_popup_action', 'close-' + Date.now());
    };

    const handlePopupClick = () => {
        setShowPopup(false);
        localStorage.setItem('watchlist_popup_action', 'close-' + Date.now());
        router.push('/watchlist');
    };

    
    const mood = useMemo(() => {
        if (!hydrated) return null;
        return getWatchlistMood(items, updatedAt, Date.now());
    }, [items, updatedAt, hydrated, showPopup]);

    return (
        <div className="relative inline-block">
            <Link href='/watchlist' aria-label="Watchlist" className="relative cursor-pointer hover:text-gray-500 transition-colors block">
                <FavouriteIcon />
                {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-black text-[10px] font-bold flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </Link>

            {showPopup && mood && (
                <div 
                    onClick={handlePopupClick}
                    className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-[#111]/95 backdrop-blur-md text-black dark:text-white border border-gray-200 dark:border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-4 z-50 transition-all duration-300 transform scale-100 cursor-pointer hover:border-primary/50 dark:hover:border-primary/50"
                    role="alert"
                >
                    
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">
                                Watchlist Reminder
                            </span>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            aria-label="Close reminder"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                        {mood.headline}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3">
                        {mood.message}
                    </p>

                    
                    <div className="text-[11px] font-bold text-primary flex items-center gap-1">
                        Click to view watchlist &rarr;
                    </div>
                </div>
            )}
        </div>
    );
}