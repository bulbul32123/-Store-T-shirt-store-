'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '@/utils/config';
import { useSyncQueue } from '@/hooks/useSyncQueue';
import { getImageForColor } from '@/utils/productImage';

const WatchlistContext = createContext();
export const useWatchlist = () => useContext(WatchlistContext);

const STORAGE_KEY = 'watchlist_v1';
const SYNC_KEY = 'watchlist_sync';
const DEBOUNCE_MS = 20000;

async function syncWishlistToServer(items) {
    const productIds = items.map((i) => i.productId);
    await axios.put(`${API_URL}/api/wishlist/sync`, { productIds });
}

export const WatchlistProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [hydrated, setHydrated] = useState(false);
    const itemsRef = useRef(items);
    itemsRef.current = items;
    const skipNextSyncRef = useRef(true);

    const { scheduleSync, flushNow, syncing, lastError, pending } = useSyncQueue({
        syncKey: SYNC_KEY,
        syncFn: syncWishlistToServer,
        debounceMs: DEBOUNCE_MS,
    });

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                setItems(parsed.items || []);
                setUpdatedAt(parsed.updatedAt || null);
            }
        } catch {
            // ignore corrupt storage
        } finally {
            setHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, updatedAt }));
    }, [items, updatedAt, hydrated]);

    useEffect(() => {
        if (!hydrated) return;
        if (skipNextSyncRef.current) {
            skipNextSyncRef.current = false;
            return;
        }
        setUpdatedAt(Date.now());
        scheduleSync(itemsRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, hydrated]);

    useEffect(() => {
        if (!hydrated) return;
        if (pending && itemsRef.current.length > 0) {
            flushNow(itemsRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hydrated]);

    useEffect(() => {
        const handler = () => flushNow(itemsRef.current);
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [flushNow]);

    const isInWatchlist = (productId) => items.some((i) => i.productId === productId);

const toggleWatchlist = (product, { size, color } = {}) => {
    const resolvedSize = size || product.sizes?.[0] || 'M';
    const resolvedColor = color || product.colors?.[0]?.name || null;

   const watchlistId =
    `${product._id}-${resolvedSize}-${resolvedColor}`;

const exists = items.some(
    (i) => i.watchlistId === watchlistId
);
    if (exists) {
        setItems((prev) =>
             prev.filter((i) => i.watchlistId !== watchlistId)
        );

        toast.success('Removed from watchlist');
        return;
    }


    const image = getImageForColor(product, resolvedColor);

    setItems((prev) => [
        ...prev,
        {
            productId: product._id,
            watchlistId,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image,
            size: resolvedSize,
            color: resolvedColor,
            addedAt: Date.now(),
        },
    ]);

    toast.success('Saved to watchlist');
};

   const removeFromWatchlist = (watchlistId) => {
    setItems((prev) =>
        prev.filter((i) => i.watchlistId !== watchlistId)
    );
};

    const syncNow = () => flushNow(itemsRef.current);

    const value = {
        items,
        itemCount: items.length,
        updatedAt,
        isInWatchlist,
        hydrated,
        toggleWatchlist,
        removeFromWatchlist,
        syncNow,
        syncing,
        lastError,
        pending,
    };

    return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
};