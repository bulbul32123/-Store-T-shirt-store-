'use client';

import { useState } from 'react';

export default function CouponBox({
    onApply,
}) {
    const [coupon, setCoupon] = useState('');

    const handleApply = () => {
        if (!coupon.trim()) return;

        onApply?.(coupon);
    };

    return (
        <div className="border rounded-xl p-6 mt-4 ">
            <h3 className="font-semibold text-lg mb-4">
                Promo Code
            </h3>

            <div className="flex flex-col gap-2">
                <input
                    type="text"
                    value={coupon}
                    onChange={(e) =>
                        setCoupon(e.target.value)
                    }
                    placeholder="Enter coupons code"
                    className="flex-1 py-4 rounded-xl border px-4 outline-none"
                />

                <button
                    onClick={handleApply}
                    className="px-6 py-3 rounded-xl bg-black text-white font-medium text-sm"
                >
                    Apply
                </button>
            </div>
        </div>
    );
}