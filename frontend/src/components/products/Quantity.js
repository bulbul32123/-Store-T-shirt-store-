import React from 'react'

export default function Quantity({ handleQuantityChange, quantity, setQuantity, product }) {
    return (
        <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
            <div className="flex items-center">
                <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className={`w-10 h-10 rounded-l-md border border-gray-300 flex items-center justify-center ${quantity <= 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    -
                </button>
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val > 0 && val <= product?.stock) {
                            setQuantity(val);
                        }
                    }}
                    min="1"
                    max={product?.stock}
                    className="w-16 h-10 border-t text-black border-b border-gray-300 text-center"
                />
                <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product?.stock}
                    className={`w-10 h-10 rounded-r-md border border-gray-300 flex items-center justify-center ${quantity >= product?.stock ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    +
                </button>
                <span className="text-sm text-gray-500 ml-4">
                    {product?.stock} available
                </span>
            </div>
        </div>
    )
}
