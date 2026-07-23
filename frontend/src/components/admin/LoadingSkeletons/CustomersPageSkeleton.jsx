export default function CustomersPageSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 p-6 animate-pulse">
            <div className="max-w-[1400px] mx-auto space-y-5">

        
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-64 rounded bg-gray-200" />
                        <div className="h-4 w-80 rounded bg-gray-100" />
                    </div>

                    <div className="h-10 w-32 rounded-lg bg-gray-200" />
                </div>

               
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
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

           
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-10 rounded-md bg-gray-100" />
                        <div className="h-10 rounded-md bg-gray-100" />
                        <div className="h-10 rounded-md bg-gray-100" />
                    </div>
                </div>

            
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

                  
                    <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-4 rounded bg-gray-200"
                            />
                        ))}
                    </div>


                    {Array.from({ length: 8 }).map((_, row) => (
                        <div
                            key={row}
                            className="grid grid-cols-6 gap-4 items-center px-6 py-5 border-b last:border-b-0"
                        >
                            
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200" />

                                <div className="space-y-2">
                                    <div className="h-4 w-36 rounded bg-gray-200" />
                                    <div className="h-3 w-28 rounded bg-gray-100" />
                                </div>
                            </div>

                            <div className="h-4 w-16 rounded bg-gray-200" />
                            <div className="h-4 w-20 rounded bg-gray-200" />
                            <div className="h-4 w-24 rounded bg-gray-200" />
                            <div className="h-6 w-20 rounded-full bg-gray-200" />

                            <div className="flex gap-2">
                                <div className="h-8 w-8 rounded bg-gray-200" />
                                <div className="h-8 w-8 rounded bg-gray-200" />
                            </div>
                        </div>
                    ))}

         
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
        </div>
    );
}