'use client';

export default function StatCard({ title, value, icon: Icon, change, changeText, bg, accent, iconBg }) {
    return (
        <div
            className="rounded-2xl p-6 flex items-start justify-between border border-black/5"
            style={{ backgroundColor: bg }}
        >
            <div>
                <p className="text-sm font-medium" style={{ color: accent }}>{title}</p>
                <p className="text-3xl font-bold mt-2 text-[#18181B] tracking-tight">{value}</p>
                {change !== null && change !== undefined && (
                    <p className={`text-sm mt-2 font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {change >= 0 ? '+' : ''}{change}% {changeText}
                    </p>
                )}
            </div>
            <div
                className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: iconBg }}
            >
                <Icon size={20} style={{ color: accent }} />
            </div>
        </div>
    );
}