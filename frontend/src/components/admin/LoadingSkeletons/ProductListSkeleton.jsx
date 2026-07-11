export default function ProductListSkeleton() {
    return (
        <div className="space-y-6 p-6 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-7 w-56 rounded bg-gray-200" />
                    <div className="h-4 w-72 rounded bg-gray-100" />
                </div>

                <div className="h-10 w-36 rounded-md bg-gray-200" />
            </div>

            {/* Search Toolbar */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-gray-200" />
                    <div className="h-10 w-full rounded-md bg-gray-100" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow overflow-hidden">
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
                        {/* Product */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded bg-gray-200 shrink-0" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-32 rounded bg-gray-200" />
                                <div className="h-3 w-20 rounded bg-gray-100" />
                            </div>
                        </div>

                        <div className="h-4 w-20 rounded bg-gray-200" />
                        <div className="h-4 w-16 rounded bg-gray-200" />
                        <div className="h-6 w-20 rounded-full bg-gray-200" />
                        <div className="h-4 w-14 rounded bg-gray-200" />
                        <div className="h-4 w-24 rounded bg-gray-200" />

                        {/* Actions */}
                        <div className="flex gap-2">
                            <div className="h-8 w-8 rounded bg-gray-200" />
                            <div className="h-8 w-8 rounded bg-gray-200" />
                        </div>
                    </div>
                ))}

                {/* Pagination */}
                <div className="flex justify-between items-center px-6 py-4">
                    <div className="h-4 w-32 rounded bg-gray-200" />

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