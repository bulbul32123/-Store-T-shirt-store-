'use client';
import { useEffect, useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useReviews } from '@/context/ReviewContext';

function isYouTube(url) {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
}

function youtubeEmbed(url) {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : null;
}

export default function ReviewMediaModal() {
    const { mediaModal, closeMediaModal } = useReviews();
    const { open, items, startIndex } = mediaModal;
    const [current, setCurrent] = useState(startIndex);

    // Sync when modal opens
    useEffect(() => { if (open) setCurrent(startIndex); }, [open, startIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (e.key === 'Escape')      closeMediaModal();
            if (e.key === 'ArrowRight') setCurrent(c => Math.min(c + 1, items.length - 1));
            if (e.key === 'ArrowLeft')  setCurrent(c => Math.max(c - 1, 0));
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, items.length, closeMediaModal]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open || !items.length) return null;

    const item = items[current];
    const isVideo = item?.type === 'video';

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                onClick={closeMediaModal}
            />

            {/* Close */}
            <button
                onClick={closeMediaModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
                <FiX size={22} />
            </button>

            {/* Counter */}
            {items.length > 1 && (
                <span className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-sm text-white/70 font-medium">
                    {current + 1} / {items.length}
                </span>
            )}

            {/* Main media */}
            <div className="relative z-10 flex items-center justify-center w-full max-w-4xl px-12">
                {/* Prev */}
                {items.length > 1 && (
                    <button
                        onClick={() => setCurrent(c => Math.max(c - 1, 0))}
                        disabled={current === 0}
                        className="absolute left-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
                    >
                        <FiChevronLeft size={28} />
                    </button>
                )}

                {/* Media container */}
                <div className="w-full max-h-[75vh] flex items-center justify-center">
                    {isVideo ? (
                        isYouTube(item.url) ? (
                            <iframe
                                src={youtubeEmbed(item.url)}
                                className="w-full max-w-2xl aspect-video rounded-xl"
                                allow="autoplay; fullscreen"
                                allowFullScreen
                            />
                        ) : (
                            <video
                                src={item.url}
                                controls
                                autoPlay
                                className="max-w-2xl w-full max-h-[70vh] rounded-xl object-contain"
                            />
                        )
                    ) : (
                        <img
                            src={item.url}
                            alt={`Media ${current + 1}`}
                            className="max-h-[70vh] max-w-full rounded-xl object-contain"
                        />
                    )}
                </div>

                {/* Next */}
                {items.length > 1 && (
                    <button
                        onClick={() => setCurrent(c => Math.min(c + 1, items.length - 1))}
                        disabled={current === items.length - 1}
                        className="absolute right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
                    >
                        <FiChevronRight size={28} />
                    </button>
                )}
            </div>

            {/* Thumbnail strip */}
            {items.length > 1 && (
                <div className="relative z-10 flex gap-2 mt-4 px-4 overflow-x-auto max-w-full">
                    {items.map((it, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 transition-all ${
                                i === current
                                    ? 'border-white scale-105'
                                    : 'border-white/30 opacity-60 hover:opacity-100'
                            }`}
                        >
                            {it.type === 'video' ? (
                                <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            ) : (
                                <img src={it.url} alt="" className="h-full w-full object-cover" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}