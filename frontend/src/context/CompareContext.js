'use client';

import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext();
export const useCompare = () => useContext(CompareContext);

const MAX_COMPARE = 4;

export const CompareProvider = ({ children }) => {
    const [items, setItems] = useState([]);

    const isInCompare = (productId) => items.some((i) => i._id === productId);

    const toggleCompare = (product) => {
        setItems((prev) => {
            const exists = prev.some((i) => i._id === product._id);
            if (exists) return prev.filter((i) => i._id !== product._id);
            if (prev.length >= MAX_COMPARE) {
                toast.error(`You can only compare up to ${MAX_COMPARE} products`);
                return prev;
            }
            return [...prev, product];
        });
    };

    const removeFromCompare = (productId) => {
        setItems((prev) => prev.filter((i) => i._id !== productId));
    };

    const clearCompare = () => setItems([]);

    const value = { items, isInCompare, toggleCompare, removeFromCompare, clearCompare, MAX_COMPARE };

    return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};