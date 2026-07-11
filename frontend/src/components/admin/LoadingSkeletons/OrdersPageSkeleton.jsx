export default function OrdersPageSkeleton() {
    return (
        <div className="p-6 space-y-6 animate-pulse">
            {/* Header */}
            <div>
                <div className="h-7 w-52 rounded bg-gray-200 mb-2" />
                <div className="h-4 w-80 rounded bg-gray-100" />
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white border border-gray-200 rounded-xl p-5"
                    >
                        <div className="h-4 w-24 rounded bg-gray-200 mb-4" />
                        <div className="h-8 w-20 rounded bg-gray-300 mb-3" />
                        <div className="h-3 w-28 rounded bg-gray-100" />
                    </div>
                ))}
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="border-b border-gray-200 p-2">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="p-3 w-24 rounded-md bg-gray-100"
                            />
                        ))}
                    </div>
                </div>

                {/* Bulk Actions */}
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between">
                    <div className="h-9 w-40 rounded bg-gray-200" />
                    <div className="flex gap-2">
                        <div className="h-9 w-24 rounded bg-gray-200" />
                        <div className="h-9 w-28 rounded bg-gray-200" />
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-4 rounded bg-gray-200"
                        />
                    ))}
                </div>

                {/* Rows */}
                {Array.from({ length: 8 }).map((_, row) => (
                    <div
                        key={row}
                        className="grid grid-cols-7 gap-4 items-center px-6 py-5 border-b last:border-b-0"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-gray-200" />
                            <div className="space-y-2">
                                <div className="h-4 w-24 rounded bg-gray-200" />
                                <div className="h-3 w-20 rounded bg-gray-100" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="h-4 w-28 rounded bg-gray-200" />
                            <div className="h-3 w-20 rounded bg-gray-100" />
                        </div>

                        <div className="h-4 w-20 rounded bg-gray-200" />
                        <div className="h-4 w-16 rounded bg-gray-200" />
                        <div className="h-6 w-20 rounded-full bg-gray-200" />
                        <div className="h-6 w-24 rounded-full bg-gray-200" />
                        <div className="h-8 w-8 rounded bg-gray-200" />
                    </div>
                ))}

                {/* Pagination */}
                <div className="flex justify-between items-center px-6 py-4">
                    <div className="h-4 w-36 rounded bg-gray-200" />

                    <div className="flex gap-2">
                        <div className="h-9 w-20 rounded bg-gray-200" />
                        <div className="h-9 w-10 rounded bg-gray-200" />
                        <div className="h-9 w-10 rounded bg-gray-200" />
                        <div className="h-9 w-20 rounded bg-gray-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}