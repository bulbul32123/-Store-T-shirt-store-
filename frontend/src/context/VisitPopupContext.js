"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useCart } from "./CartContext";
import { useWatchlist } from "./WatchlistContext";

const VisitPopupContext = createContext();
export const useVisitPopup = () => useContext(VisitPopupContext);

const STORAGE_KEY = "visit_popup_state";
const COOLDOWN_MS = 3 * 60 * 60 * 1000;

export const VisitPopupProvider = ({ children }) => {
  const { items: cartItems, hydrated: cartHydrated } = useCart();
  const { items: watchlistItems, hydrated: watchlistHydrated } = useWatchlist();

  const [phase, setPhase] = useState("idle");
  const decidedRef = useRef(false);

  useEffect(() => {
    if (decidedRef.current) return;
    if (!cartHydrated || !watchlistHydrated) return;
    decidedRef.current = true;

    let lastShown = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) lastShown = JSON.parse(raw).lastShown;
    } catch {}

    const dueForShow = !lastShown || Date.now() - lastShown > COOLDOWN_MS;
    if (dueForShow) {
      const t = setTimeout(() => setPhase("cart"), 1200);
      return () => clearTimeout(t);
    }
  }, [cartHydrated, watchlistHydrated]);

  const dismissCart = () => setPhase("watchlist");

  const dismissWatchlist = () => {
    setPhase("done");
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ lastShown: Date.now() }),
      );
    } catch {}
  };
  const value = {
    showCartPopup: phase === "cart",
    showWatchlistPopup: phase === "watchlist",
    cartItemCount: cartItems.length,
    watchlistItemCount: watchlistItems.length,
    dismissCart,
    dismissWatchlist,
  };

  return (
    <VisitPopupContext.Provider value={value}>
      {children}
    </VisitPopupContext.Provider>
  );
};
