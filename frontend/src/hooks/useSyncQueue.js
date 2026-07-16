'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
export function useSyncQueue({ syncKey, syncFn, debounceMs = 20000 }) {
    const pendingFlagKey = `${syncKey}_pending`;
    const timerRef = useRef(null);
    const inFlightRef = useRef(false);
    const retryQueuedRef = useRef(false);
    const latestPayloadRef = useRef(null);

    const [syncing, setSyncing] = useState(false);
    const [lastError, setLastError] = useState(null);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        try {
            setPending(localStorage.getItem(pendingFlagKey) === 'true');
        } catch {
        }
    }, [pendingFlagKey]);

    const setPendingFlag = useCallback(
        (value) => {
            try {
                if (value) localStorage.setItem(pendingFlagKey, 'true');
                else localStorage.removeItem(pendingFlagKey);
            } catch {
            }
            setPending(value);
        },
        [pendingFlagKey]
    );

    const runSync = useCallback(
        async (payload) => {
            if (inFlightRef.current) {
                retryQueuedRef.current = true;
                latestPayloadRef.current = payload;
                return;
            }

            inFlightRef.current = true;
            setSyncing(true);
            setLastError(null);

            try {
                await syncFn(payload);
                setPendingFlag(false); 
                setLastError(null);
            } catch (err) {
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