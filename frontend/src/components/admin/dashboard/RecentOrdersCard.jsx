'use client';
import { FiFileText } from 'react-icons/fi';

const STATUS_COLORS = {
    pending: { bg: '#F4F4F5', text: '#52525B' },
    processing: { bg: '#EFF6FF', text: '#2563EB' },
    confirmed: { bg: '#EFF6FF', text: '#2563EB' },
    shipped: { bg: '#FFFBEA', text: '#B45309' },
    delivered: { bg: '#F0FDF4', text: '#16A34A' },
    cancelled: { bg: '#FEF2F3', text: '#DC2626' },
};

export default function RecentOrdersCard({ orders = [] }) {
    return (
        <div className="bg-white rounded-2xl border border-black/5 p-6">
            <h2 className="text-lg font-bold text-[#18181B] mb-5">Recent Orders</h2>

            {!orders.length ? (
                <div className="text-center py-10">
                    <FiFileText size={28} className="mx-auto text-[#D4D4D8] mb-2" />
                    <p className="text-sm text-[#71717A]">No recent orders</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {orders.map((order) => {
                        const style = STATUS_COLORS[order.orderStatus] || STATUS_COLORS.pending;
                        return (
                            <div key={order._id} className="flex justify-between items-center p-3 rounded-xl hover:bg-[#FAFAF9] transition-colors">
                                <div>
                                    <span className="font-semibold text-sm text-[#18181B]">{order.user?.name || 'Unknown User'}</span>
                                    <p className="text-xs text-[#71717A] mt-0.5">{order.user?.email}</p>
                                    <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                                    <span className="font-bold text-sm text-[#18181B]">
                                        ${order.totalPrice?.toFixed(2) || '0.00'}
                                    </span>
                                    <span
                                        className="text-[11px] font-medium px-2 py-0.5 rounded-full capitalize"
                                        style={{ backgroundColor: style.bg, color: style.text }}
                                    >
                                        {order.orderStatus}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}