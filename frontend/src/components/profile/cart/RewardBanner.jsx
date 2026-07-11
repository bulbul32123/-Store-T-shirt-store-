'use client';
import { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';
import { rewardsApi } from '@/lib/rewardsApi';

export default function RewardBanner({ onClaim }) {
    const [reward, setReward] = useState(null);

    useEffect(() => {
        rewardsApi.getMine()
            .then((res) => {
                if (res.data?.length) setReward(res.data[0]);
            })
            .catch(() => {});
    }, []);

    if (!reward) return null;

    return (
        <div className="border border-amber-300 bg-amber-50 rounded-xl p-4 mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <Gift size={20} className="text-amber-600 shrink-0" />
                <div>
                    <p className="font-semibold text-sm text-amber-900">Reward available</p>
                    <p className="text-xs text-amber-700">
                        {reward.discountValue}% off — code {reward.code}
                    </p>
                </div>
            </div>
            <button
                onClick={() => onClaim?.(reward.code)}
                className="text-xs font-medium bg-amber-600 text-white px-3 py-2 rounded-lg whitespace-nowrap"
            >
                Apply
            </button>
        </div>
    );
}