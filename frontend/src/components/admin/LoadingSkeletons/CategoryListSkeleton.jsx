export default function CategoryListSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
    
            <div className="flex items-center justify-between">
                <div className="h-8 w-64 rounded bg-gray-200" />
                <div className="h-10 w-40 rounded-md bg-gray-200" />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
             
                <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b bg-gray-50">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-4 w-20 rounded bg-gray-200" />
                    <div className="h-4 w-20 rounded bg-gray-200" />
                </div>

        
                {Array.from({ length: 7 }).map((_, i) => (
                    <div
                        key={i}
                        className="grid grid-cols-3 gap-4 items-center px-6 py-5 border-b last:border-b-0"
                    >
                     
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />

                            <div className="space-y-2">
                                <div className="h-4 w-36 rounded bg-gray-200" />
                                <div className="h-3 w-24 rounded bg-gray-100" />
                            </div>
                        </div>

        
                        <div>
                            <div className="h-6 w-16 rounded-full bg-gray-200" />
                        </div>

           
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded bg-gray-200" />
                            <div className="w-8 h-8 rounded bg-gray-200" />
                            <div className="w-8 h-8 rounded bg-gray-200" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}