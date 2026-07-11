'use client';
import { useState } from 'react';
import { X } from 'lucide-react';

export default function CouponBox({ onApply, onRemove, appliedCoupon, loading }) {
    const [coupon, setCoupon] = useState('');

    const handleApply = () => {
        if (!coupon.trim()) return;
        onApply?.(coupon.trim());
    };

    if (appliedCoupon) {
        return (
            <div className="border rounded-xl p-6 mt-4 bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-sm text-green-800">
                            {appliedCoupon.code} applied
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                            -${appliedCoupon.discountAmount.toFixed(2)}
                        </p>
                    </div>
                    <button onClick={onRemove} className="text-green-800">
                        <X size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded-xl p-6 mt-4">
            <h3 className="font-semibold text-lg mb-4">Promo Code</h3>
            <div className="flex flex-col gap-2">
                <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 py-4 rounded-xl border px-4 outline-none"
                />
                <button
                    onClick={handleApply}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-black text-white font-medium text-sm disabled:opacity-50"
                >
                    {loading ? 'Applying...' : 'Apply'}
                </button>
            </div>
        </div>
    );
}