export default function CouponsPageSkeleton() {
    return (
        <div className="p-6 space-y-6 animate-pulse">

            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-64 rounded bg-gray-200" />
                    <div className="h-4 w-80 rounded bg-gray-100" />
                </div>

                <div className="h-10 w-40 rounded-lg bg-gray-200" />
            </div>

   
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="h-10 w-full max-w-xs rounded-lg bg-gray-100" />
                <div className="h-10 w-40 rounded-lg bg-gray-100" />
            </div>

     
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      
                <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-4 rounded bg-gray-200"
                        />
                    ))}
                </div>

     
                {Array.from({ length: 4 }).map((_, row) => (
                    <div
                        key={row}
                        className="grid grid-cols-7 gap-4 items-center px-6 py-5 border-b last:border-b-0"
                    >
                        <div className="space-y-2">
                            <div className="h-4 w-24 rounded bg-gray-200" />
                            <div className="h-3 w-16 rounded bg-gray-100" />
                        </div>

                        <div className="h-4 w-20 rounded bg-gray-200" />
                        <div className="h-4 w-20 rounded bg-gray-200" />
                        <div className="h-6 w-20 rounded-full bg-gray-200" />
                        <div className="h-4 w-16 rounded bg-gray-200" />
                        <div className="h-4 w-20 rounded bg-gray-200" />

                        <div className="flex gap-2">
                            <div className="h-8 w-8 rounded bg-gray-200" />
                            <div className="h-8 w-8 rounded bg-gray-200" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}