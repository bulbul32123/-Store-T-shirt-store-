'use client';

import {
    Truck,
    ShieldCheck,
    RotateCcw,
    BadgeCheck,
} from 'lucide-react';

export default function DeliveryAndTrust() {
    return (
        <div className="border rounded-3xl p-6 mt-6">
            <h3 className="font-semibold text-lg mb-4">
                Delivery & Protection
            </h3>

            <div className="space-y-4">
                <div className="flex gap-3">
                    <Truck size={18} />
                    <div>
                        <p className="font-medium">
                            Estimated Delivery
                        </p>
                        <p className="text-sm text-[#6F6F6F]">
                            2–5 business days
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <ShieldCheck size={18} />
                    <div>
                        <p className="font-medium">
                            Secure Checkout
                        </p>
                        <p className="text-sm text-[#6F6F6F]">
                            SSL encrypted payments
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <RotateCcw size={18} />
                    <div>
                        <p className="font-medium">
                            Easy Returns
                        </p>
                        <p className="text-sm text-[#6F6F6F]">
                            7 day return policy
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <BadgeCheck size={18} />
                    <div>
                        <p className="font-medium">
                            Authentic Products
                        </p>
                        <p className="text-sm text-[#6F6F6F]">
                            Quality guaranteed
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}