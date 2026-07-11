'use client';
import { FiAlertTriangle } from 'react-icons/fi';

export default function LowStockCard({ products = [] }) {
    return (
        <div className="bg-white rounded-2xl border border-black/5 p-6">
            <h2 className="text-lg font-bold text-[#18181B] mb-5">Low Stock Products</h2>

            {!products.length ? (
                <div className="text-center py-10">
                    <FiAlertTriangle size={28} className="mx-auto text-[#D4D4D8] mb-2" />
                    <p className="text-sm text-[#71717A]">All products are well stocked</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {products.map((product) => (
                        <div key={product._id} className="flex justify-between items-center p-3 rounded-xl hover:bg-[#FAFAF9] transition-colors">
                            <div className="flex-1 min-w-0">
                                <span className="font-semibold text-sm text-[#18181B] truncate block">{product.name}</span>
                                {product.category && (
                                    <p className="text-xs text-[#71717A] mt-0.5">{product.category.name}</p>
                                )}
                            </div>
                            <span
                                className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                                style={{
                                    backgroundColor: product.stockQuantity <= 5 ? '#FEF2F3' : '#FFFBEA',
                                    color: product.stockQuantity <= 5 ? '#DC2626' : '#B45309',
                                }}
                            >
                                {product.stockQuantity} left
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}