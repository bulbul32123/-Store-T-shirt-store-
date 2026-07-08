'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic debounced sync queue with:
 * - localStorage-backed "pending" flag (survives reloads)
 * - single in-flight request guard (no duplicate syncs)
 * - automatic retry-on-next-trigger if a sync fails (local data stays intact)
 */
export function useSyncQueue({ syncKey, syncFn, debounceMs = 20000 }) {
    const pendingFlagKey = `${syncKey}_pending`;
    const timerRef = useRef(null);
    const inFlightRef = useRef(false);
    const retryQueuedRef = useRef(false);
    const latestPayloadRef = useRef(null);

    const [syncing, setSyncing] = useState(false);
    const [lastError, setLastError] = useState(null);
    const [pending, setPending] = useState(false);

    // read persisted pending flag on mount
    useEffect(() => {
        try {
            setPending(localStorage.getItem(pendingFlagKey) === 'true');
        } catch {
            // ignore
        }
    }, [pendingFlagKey]);

    const setPendingFlag = useCallback(
        (value) => {
            try {
                if (value) localStorage.setItem(pendingFlagKey, 'true');
                else localStorage.removeItem(pendingFlagKey);
            } catch {
                // ignore
            }
            setPending(value);
        },
        [pendingFlagKey]
    );

    const runSync = useCallback(
        async (payload) => {
            if (inFlightRef.current) {
                // a sync is already running — queue this payload as a retry
                retryQueuedRef.current = true;
                latestPayloadRef.current = payload;
                return;
            }

            inFlightRef.current = true;
            setSyncing(true);
            setLastError(null);

            try {
                await syncFn(payload);
                setPendingFlag(false); // MongoDB is now source of truth
                setLastError(null);
            } catch (err) {
                // keep pending flag true — local data is untouched, we retry later
                setLastError(err?.message || 'Sync failed');
            } finally {
                inFlightRef.current = false;
                setSyncing(false);

                if (retryQueuedRef.current) {
                    retryQueuedRef.current = false;
                    const nextPayload = latestPayloadRef.current;
                    setTimeout(() => runSync(nextPayload), 500);
                }
            }
        },
        [syncFn, setPendingFlag]
    );

    const scheduleSync = useCallback(
        (payload) => {
            latestPayloadRef.current = payload;
            setPendingFlag(true);

            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                runSync(latestPayloadRef.current);
            }, debounceMs);
        },
        [debounceMs, runSync, setPendingFlag]
    );

    const flushNow = useCallback(
        (payload) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            const finalPayload = payload !== undefined ? payload : latestPayloadRef.current;
            if (finalPayload === undefined || finalPayload === null) return Promise.resolve();
            return runSync(finalPayload);
        },
        [runSync]
    );

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return { scheduleSync, flushNow, syncing, lastError, pending };
}