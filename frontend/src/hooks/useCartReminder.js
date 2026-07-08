import { useEffect, useRef, useState, useCallback } from 'react';
import STAGES, { CART_REMINDER_KEY } from '@/utils/cartReminderStages';

// Lightweight reminder engine hook.
// - Only updates React state when a popup needs to appear or disappear.
// - Uses a single scheduler timer; does not poll or store now in state.
// - Persists progress to localStorage to survive refreshes and sync across tabs.

function readStorage() {
    try {
        const raw = localStorage.getItem(CART_REMINDER_KEY);
        return raw ? JSON.parse(raw) : { stageIndex: -1, lastUpdatedAt: null, lastShownAt: null };
    } catch (e) {
        return { stageIndex: -1, lastUpdatedAt: null, lastShownAt: null };
    }
}

function writeStorage(obj) {
    try {
        localStorage.setItem(CART_REMINDER_KEY, JSON.stringify(obj));
    } catch (e) {
        // ignore
    }
}

export default function useCartReminder(items, updatedAt, opts = {}) {
    const { testMode = false } = opts;

    const scheduleRef = useRef(null); // { id, stageIndex, triggerTime }
    const autoCloseRef = useRef(null); // { id, endAt, remaining }
    const pauseRef = useRef(false);
    const mountedRef = useRef(true);

    const [visible, setVisible] = useState(false);
    const [activeStageIndex, setActiveStageIndex] = useState(null);

    // Determine config delays (supports test mode via opts)
    const delays = STAGES.map((s) => s.delay);

    // Clear all timers
    const clearSchedule = useCallback(() => {
        if (scheduleRef.current) {
            clearTimeout(scheduleRef.current.id);
            scheduleRef.current = null;
        }
        if (autoCloseRef.current) {
            clearTimeout(autoCloseRef.current.id);
            autoCloseRef.current = null;
        }
    }, []);

    // Reset storage (called when cart emptied or checkout)
    const resetHistory = useCallback(() => {
        clearSchedule();
        try {
            localStorage.removeItem(CART_REMINDER_KEY);
            // broadcast to other tabs
            localStorage.setItem('cart_reminder_action', 'reset-' + Date.now());
        } catch (e) {}
    }, [clearSchedule]);

    // Compute next stage index that hasn't been shown yet
    const computeNext = useCallback(() => {
        const stored = readStorage();
        // If updatedAt changed (cart activity), allow stages from beginning
        if (stored.lastUpdatedAt !== updatedAt) {
            stored.stageIndex = -1;
        }

        // If cart is empty, just reset
        if (!items || items.length === 0) return null;

        const nextIndex = stored.stageIndex + 1;
        if (nextIndex >= STAGES.length) return null; // no further stages

        const stage = STAGES[nextIndex];
        if (!updatedAt) return null;

        const triggerTime = updatedAt + stage.delay;
        return { nextIndex, triggerTime };
    }, [items, updatedAt]);

    // Show popup for a stage
    const showStage = useCallback((stageIndex) => {
        if (!mountedRef.current) return;
        const stage = STAGES[stageIndex];
        if (!stage) return;

        // Avoid showing if another popup is visible
        if (visible) return;

        setActiveStageIndex(stageIndex);
        setVisible(true);

        // persist that we've shown this stage
        const stored = readStorage();
        stored.stageIndex = stageIndex;
        stored.lastUpdatedAt = updatedAt;
        stored.lastShownAt = Date.now();
        writeStorage(stored);

        // schedule auto close between 8-12s
        const duration = 8000 + Math.floor(Math.random() * 4000);
        const endAt = Date.now() + duration;
        if (autoCloseRef.current) {
            clearTimeout(autoCloseRef.current.id);
        }
        autoCloseRef.current = {
            id: setTimeout(() => {
                setVisible(false);
                autoCloseRef.current = null;
                // notify other tabs that popup closed
                try { localStorage.setItem('cart_reminder_action', 'closed-' + Date.now()); } catch (e) {}
            }, duration),
            endAt,
        };
    }, [visible, updatedAt]);

    // Pause and resume auto-close
    const pauseAutoClose = useCallback(() => {
        if (!autoCloseRef.current) return;
        const remaining = Math.max(0, autoCloseRef.current.endAt - Date.now());
        clearTimeout(autoCloseRef.current.id);
        autoCloseRef.current.remaining = remaining;
        autoCloseRef.current.endAt = null;
        pauseRef.current = true;
    }, []);

    const resumeAutoClose = useCallback(() => {
        if (!autoCloseRef.current || !pauseRef.current) return;
        const remaining = autoCloseRef.current.remaining || 0;
        autoCloseRef.current.id = setTimeout(() => {
            setVisible(false);
            autoCloseRef.current = null;
            try { localStorage.setItem('cart_reminder_action', 'closed-' + Date.now()); } catch (e) {}
        }, remaining);
        autoCloseRef.current.endAt = Date.now() + remaining;
        pauseRef.current = false;
    }, []);

    // schedule the next popup based on updatedAt and stored progress
    useEffect(() => {
        mountedRef.current = true;
        if (!items) return;

        // Reset when cart becomes empty
        if (items.length === 0) {
            resetHistory();
            return;
        }

        // compute next trigger
        const next = computeNext();
        if (!next) {
            // nothing to schedule
            return;
        }

        const now = Date.now();
        const delay = Math.max(0, next.triggerTime - now);

        // If already scheduled and identical, skip
        if (scheduleRef.current && scheduleRef.current.stageIndex === next.nextIndex && scheduleRef.current.triggerTime === next.triggerTime) {
            return;
        }

        // clear previous schedule
        if (scheduleRef.current) {
            clearTimeout(scheduleRef.current.id);
        }

        const id = setTimeout(() => {
            // On trigger, show popup for that stage
            showStage(next.nextIndex);
            scheduleRef.current = null;
        }, delay);

        scheduleRef.current = { id, stageIndex: next.nextIndex, triggerTime: next.triggerTime };

        return () => {
            if (scheduleRef.current) {
                clearTimeout(scheduleRef.current.id);
                scheduleRef.current = null;
            }
        };
    }, [items, updatedAt, computeNext, resetHistory, showStage]);

    // Cross-tab listener to react when other tab resets or closes popup
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'cart_reminder_action' && e.newValue) {
                if (e.newValue.startsWith('reset-')) {
                    // another tab reset — clear local timers
                    clearSchedule();
                    setVisible(false);
                    setActiveStageIndex(null);
                }
                if (e.newValue.startsWith('closed-')) {
                    setVisible(false);
                    setActiveStageIndex(null);
                }
            }
            if (e.key === CART_REMINDER_KEY) {
                // storage updated — no immediate UI change unless it affects scheduling
                // This hook will recalc on items/updatedAt change; keep quiet here.
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [clearSchedule]);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
            clearSchedule();
        };
    }, [clearSchedule]);

    const onManualClose = useCallback(() => {
        // user dismissed popup — mark as closed and allow later stages
        setVisible(false);
        setActiveStageIndex(null);
        try { localStorage.setItem('cart_reminder_action', 'closed-' + Date.now()); } catch (e) {}
    }, []);

    return {
        visible,
        stage: activeStageIndex != null ? STAGES[activeStageIndex] : null,
        pauseAutoClose,
        resumeAutoClose,
        resetHistory,
        onManualClose,
    };
}
