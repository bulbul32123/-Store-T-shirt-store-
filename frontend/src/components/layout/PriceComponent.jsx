import { calculateFinalPrice, parseDiscount } from '@/helpers/price';
import React from 'react'

export default function PriceComponent({product}) {
    const discountPercent = parseDiscount(product.discount);
    const finalPrice = calculateFinalPrice(product.price, product.discount);
    const hasDiscount = discountPercent > 0;
    return (
        <div className="flex items-center gap-1">
            <span>${finalPrice}</span>

            {hasDiscount && (
                <>
                    <span className="line-through text-xs text-gray-400">
                        ${product.price}
                    </span>
                    <span className="text-red-500 bg-[#FFBEBE] py-1 px-2 rounded-full text-[10px]">
                        {discountPercent}% OFF
                    </span>
                </>
            )}
        </div>
    )
}
