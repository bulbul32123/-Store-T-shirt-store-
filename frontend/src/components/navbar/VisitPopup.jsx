'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const AUTO_DISMISS_MS = 10000;

export default function VisitPopup({ icon: Icon, headline, message, cta, href, onDismiss }) {
    const router = useRouter();
    const popupRef = useRef(null);
    const timerRef = useRef(null);
    const remainingRef = useRef(AUTO_DISMISS_MS);
    const startedAtRef = useRef(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const startTimer = (duration) => {
        clearTimer();
        startedAtRef.current = Date.now();
        timerRef.current = setTimeout(onDismiss, duration);
    };

    useEffect(() => {
        remainingRef.current = AUTO_DISMISS_MS;
        startTimer(AUTO_DISMISS_MS);
        return clearTimer;
    }, []);

    const handleMouseEnter = () => {
        const elapsed = Date.now() - startedAtRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
        clearTimer();
    };

    const handleMouseLeave = () => {
        startTimer(remainingRef.current);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) onDismiss();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onDismiss]);

    const handleCtaClick = () => {
        clearTimer();
        onDismiss();
        router.push(href);
    };

    return (
        <motion.div
            ref={popupRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E5E5E5] p-4 z-50"
        >
            <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss"
                className="absolute top-3 right-3 text-[#6F6F6F] hover:text-[#111]"
            >
                <X size={14} />
            </button>

            <div className="flex items-center gap-2 mb-1.5 pr-4">
                {Icon && <Icon size={16} className="text-[#111] shrink-0" />}
                <p className="text-sm font-bold uppercase tracking-tight text-[#111]">{headline}</p>
            </div>

            <p className="text-sm text-[#6F6F6F] mb-4">{message}</p>

            <button
                type="button"
                onClick={handleCtaClick}
                className="w-full rounded-full bg-[#111] text-white text-xs font-bold uppercase tracking-wide py-2.5 hover:bg-white hover:text-[#111] border border-[#111] transition-colors"
            >
                {cta} →
            </button>
        </motion.div>
    );
}