import React from 'react'

export default function SizeSelection({ product, setSelectedSize, selectedSize }) {
    return (
        <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                    <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md ${selectedSize === size
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                    >
                        {size}
                    </button>
                ))}
            </div>
        </div>
    )
}
