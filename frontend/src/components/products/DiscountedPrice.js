import React from 'react'

export default function DiscountedPrice({ discountedPrice, product }) {
    return (
        <div className="flex items-center mb-6">
            {discountedPrice ? (
                <>
                    <span className="text-3xl font-bold text-gray-900">
                        ${discountedPrice?.toFixed(2)}
                    </span>
                    <span className="text-xl text-gray-500 line-through ml-3">
                        ${product.price?.toFixed(2)}
                    </span>
                </>
            ) : (
                <span className="text-3xl font-bold text-gray-900">
                    ${product.price?.toFixed(2)}
                </span>
            )}
        </div>
    )
}
