import LivingWatchlistPanel from '@/components/profile/watchlist/LivingWatchlistPanel';

export const metadata = {
  title: "Watchlist | Payra",
  description:
    "Things you're keeping an eye on. Tap the heart on products you love and they'll appear here.",
};


export default function WatchlistPage() {
    return (
        <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#111] mb-1">Watchlist</h2>
            <p className="text-sm text-[#6F6F6F] mb-8">Things you're keeping an eye on.</p>
            <LivingWatchlistPanel />
        </div>
    );
}