export default function ReviewsPageTopSkeleton() {
    return (
        <div className="space-y-5 animate-pulse">
    
            <div>
                <div className="h-8 w-64 rounded bg-gray-200 mb-2" />
                <div className="h-4 w-80 rounded bg-gray-100" />
            </div>

     
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />

                        <div className="flex-1">
                            <div className="h-3 w-24 rounded bg-gray-200 mb-3" />
                            <div className="h-7 w-16 rounded bg-gray-300" />
                        </div>
                    </div>
                ))}
            </div>

       
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-10 rounded-lg bg-gray-100"
                        />
                    ))}
                </div>

                <div className="flex justify-end mt-4">
                    <div className="h-10 w-28 rounded-lg bg-gray-200" />
                </div>
            </div>
        </div>
    );
}