'use client';

function Pulse({ className }) {
    return <div className={`animate-pulse bg-[#E4E4E7] rounded-lg ${className}`} />;
}

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl p-6 bg-[#FAFAF9] border border-black/5">
                    <Pulse className="h-3 w-24 mb-3" />
                    <Pulse className="h-8 w-20 mb-3" />
                    <Pulse className="h-3 w-28" />
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-black/5 p-6">
            <Pulse className="h-5 w-40 mb-2" />
            <Pulse className="h-3 w-24 mb-6" />
            <Pulse className="h-64 w-full" />
        </div>
    );
}

export function ListSkeleton({ rows = 5 }) {
    return (
        <div className="bg-white rounded-2xl border border-black/5 p-6">
            <Pulse className="h-5 w-36 mb-5" />
            <div className="space-y-3">
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Pulse className="h-11 w-11 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Pulse className="h-3 w-3/4" />
                            <Pulse className="h-2.5 w-1/2" />
                        </div>
                        <Pulse className="h-4 w-14 shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}