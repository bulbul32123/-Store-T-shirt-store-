'use client';

import { useState, useEffect, useMemo } from 'react';

/**
 * A custom hook that returns the current mood for a cart or watchlist
 * and schedules state updates at the exact boundary when the mood changes.
 * This completely avoids periodic polling (setInterval) and minimizes re-renders.
 */
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

        // Transition thresholds in ms
        const thresholds = isTestMode
            ? (isWatchlist ? [30 * 1000] : [30 * 1000, 60 * 1000])
            : (isWatchlist ? [24 * HOUR] : [2 * HOUR, 24 * HOUR]);

        // Find the next threshold that hasn't been crossed yet
        const nextThreshold = thresholds.find((t) => timeElapsed < t);

        if (nextThreshold !== undefined) {
            const delay = nextThreshold - timeElapsed;
            // Schedule re-render slightly after the threshold to ensure Date.now() has crossed it
            const timer = setTimeout(checkTransition, delay + 100);
            return () => clearTimeout(timer);
        }
    }, [items, updatedAt, isWatchlist]);

    return useMemo(() => getMoodFn(items, updatedAt, now), [items, updatedAt, getMoodFn, now]);
}
