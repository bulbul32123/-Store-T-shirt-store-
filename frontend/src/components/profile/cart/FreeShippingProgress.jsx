'use client';

export default function FreeShippingProgress({
    subtotal,
    threshold = 100,
}) {
    const remaining = Math.max(threshold - subtotal, 0);

    const progress = Math.min(
        (subtotal / threshold) * 100,
        100
    );

    return (
        <div className="bg-[#F7F7F7] rounded-3xl p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">
                    Free Shipping Progress
                </h3>

                {remaining <= 0 && (
                    <span className="text-green-600 text-sm font-medium">
                        Unlocked
                    </span>
                )}
            </div>

            <p className="text-sm text-[#6F6F6F] mb-4">
                {remaining > 0
                    ? `You're only $${remaining.toFixed(
                          2
                      )} away from free shipping`
                    : 'Congratulations! You unlocked free shipping.'}
            </p>

            <div className="h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
                <div
                    className="h-full bg-black transition-all duration-500"
                    style={{
                        width: `${progress}%`,
                    }}
                />
            </div>
        </div>
    );
}