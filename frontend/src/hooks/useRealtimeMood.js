'use client';

import { useState, useEffect, useMemo } from 'react';
export function useRealtimeMood(items, updatedAt, getMoodFn, isWatchlist = false) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!items || !items.length || !updatedAt) {
            return;
        }

        const checkTransition = () => {
            setNow(Date.now());
        };

        const timeElapsed = Date.now() - updatedAt;
        const HOUR = 60 * 60 * 1000;

        const isTestMode = typeof window !== 'undefined' && localStorage.getItem('cart_popup_test_mode') === 'true';

        const thresholds = isTestMode
            ? (isWatchlist ? [30 * 1000] : [30 * 1000, 60 * 1000])
            : (isWatchlist ? [24 * HOUR] : [2 * HOUR, 24 * HOUR]);

        const nextThreshold = thresholds.find((t) => timeElapsed < t);

        if (nextThreshold !== undefined) {
            const delay = nextThreshold - timeElapsed;
            const timer = setTimeout(checkTransition, delay + 100);
            return () => clearTimeout(timer);
        }
    }, [items, updatedAt, isWatchlist]);

    return useMemo(() => getMoodFn(items, updatedAt, now), [items, updatedAt, getMoodFn, now]);
}
