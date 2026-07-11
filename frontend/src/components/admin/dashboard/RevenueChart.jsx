'use client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-black/10 rounded-xl px-4 py-3 shadow-lg">
            <p className="text-xs font-medium text-[#71717A] mb-1">{label}</p>
            <p className="text-sm font-bold text-[#16A34A]">${payload[0].value.toFixed(2)}</p>
        </div>
    );
}

export default function RevenueChart({ data = [] }) {
    const formatted = data.map((d) => ({
        label: `${MONTH_NAMES[d._id.month - 1]} '${String(d._id.year).slice(2)}`,
        revenue: d.revenue,
    }));

    if (!formatted.length) {
        return (
            <div className="bg-white rounded-2xl border border-black/5 p-8 flex items-center justify-center h-80">
                <p className="text-sm text-[#71717A]">No revenue data yet — it'll show up here once orders come in.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-black/5 p-6">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-[#18181B]">Revenue Trend</h2>
                <p className="text-sm text-[#71717A] mt-0.5">Last 6 months</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={formatted} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#16A34A" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#71717A' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#71717A' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={2.5} fill="url(#revenueGradient)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}