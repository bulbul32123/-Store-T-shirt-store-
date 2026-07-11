'use client';
import { FiUsers, FiShoppingBag, FiDollarSign, FiBox } from 'react-icons/fi';
import StatCard from './StatCard';

export default function AdminStats({ stats }) {
    const statCards = [
        {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue.toFixed(2)}`,
            icon: FiDollarSign,
            change: stats.revenueChange,
            changeText: 'vs last month',
            bg: '#F0FDF4',
            accent: '#16A34A',
            iconBg: '#DCFCE7',
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: FiShoppingBag,
            change: stats.ordersChange,
            changeText: 'vs last month',
            bg: '#EFF6FF',
            accent: '#2563EB',
            iconBg: '#DBEAFE',
        },
        {
            title: 'Total Customers',
            value: stats.totalCustomers,
            icon: FiUsers,
            change: stats.customersChange,
            changeText: 'vs last month',
            bg: '#FFFBEA',
            accent: '#B45309',
            iconBg: '#FEF3C7',
        },
        {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: FiBox,
            change: null,
            changeText: '',
            bg: '#FEF2F3',
            accent: '#DC2626',
            iconBg: '#FEE2E2',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((card) => (
                <StatCard key={card.title} {...card} />
            ))}
        </div>
    );
}