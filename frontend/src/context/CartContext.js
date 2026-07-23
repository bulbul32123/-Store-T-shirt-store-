'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '@/utils/config';
import { useSyncQueue } from '@/hooks/useSyncQueue';
import { getImageForColor } from '@/utils/productImage';
import { computeFinalPrice } from "@/utils/pricing";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const STORAGE_KEY = 'cart_v1';
const SYNC_KEY = 'cart_sync';
const DEBOUNCE_MS = 20000; 


async function syncCartToServer(items) {
    const payload = items.map((i) => ({
        product: i.productId,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
    }));
    await axios.put(`${API_URL}/api/cart/sync`, { items: payload });
}

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [hydrated, setHydrated] = useState(false);
    const itemsRef = useRef(items);
    itemsRef.current = items;
    const skipNextSyncRef = useRef(true); 

    const { scheduleSync, flushNow, syncing, lastError, pending } = useSyncQueue({
        syncKey: SYNC_KEY,
        syncFn: syncCartToServer,
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
        const handler = () => {
            flushNow(itemsRef.current);
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [flushNow]);

 const addToCart = (product, { size, color, quantity = 1 } = {}) => {
   const resolvedSize = size || product.sizes?.[0] || "M";
   const resolvedColor = color || product.colors?.[0]?.name || null;

   const image = getImageForColor(product, resolvedColor);

   const lineId = `${product._id}-${resolvedSize}-${resolvedColor}`;

   const existing = items.find((i) => i.lineId === lineId);

   if (existing) {
     setItems((prev) =>
       prev.map((i) =>
         i.lineId === lineId ? { ...i, quantity: i.quantity + quantity } : i,
       ),
     );

     toast.success(
       `${product.name} quantity updated (${existing.quantity + quantity} in cart)`,
     );

     return;
   }

   setItems((prev) => [
     ...prev,
     {
       lineId,
       productId: product._id,
       name: product.name,
       slug: product.slug,
       price: computeFinalPrice(product),
       image,
       size: resolvedSize,
       color: resolvedColor,
       quantity,
       isFreeShipping: product.isFreeShipping, 
       addedAt: Date.now(),
     },
   ]);

   toast.success(`${product.name} added to cart`);
 };;

const getProductQuantityInCart = (productId) =>
    items.filter((i) => i.productId === productId).reduce((sum, i) => sum + i.quantity, 0);
    const removeFromCart = (lineId) => {
        setItems((prev) => prev.filter((i) => i.lineId !== lineId));
    };

    const updateQuantity = (lineId, quantity) => {
        if (quantity < 1) return removeFromCart(lineId);
        setItems((prev) => prev.map((i) => (i.lineId === lineId ? { ...i, quantity } : i)));
    };

    const clearCart = () => {
        setItems([]);
    };

    const syncNow = () => flushNow(itemsRef.current);

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = +items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);

    const value = {
        items,
        itemCount,
        subtotal,
        updatedAt,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        hydrated,
        syncNow,
        syncing,
        getProductQuantityInCart,
        lastError,
        pending,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};