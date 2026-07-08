import LivingWatchlistPanel from '@/components/profile/watchlist/LivingWatchlistPanel';

export default function WatchlistPage() {
    return (
        <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#111] mb-1">Watchlist</h2>
            <p className="text-sm text-[#6F6F6F] mb-8">Things you're keeping an eye on.</p>
            <LivingWatchlistPanel />
        </div>
    );
}