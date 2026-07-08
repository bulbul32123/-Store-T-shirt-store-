'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, Bell, ShoppingBag, Heart } from 'lucide-react';

const NAV_ITEMS = [
    { href: '/profile/account', label: 'Profile', icon: User },
    { href: '/profile/orders', label: 'Orders', icon: Package },
    { href: '/profile/notifications', label: 'Notifications', icon: Bell },
    { href: '/profile/cart', label: 'Cart', icon: ShoppingBag },
    { href: '/profile/watchlist', label: 'Watchlist', icon: Heart },
];

export default function ProfileSidebar() {
    const pathname = usePathname();

    return (
        <nav className="md:w-56 shrink-0">
            <ul className="flex md:flex-col overflow-x-auto md:overflow-visible gap-1 border-b md:border-b-0 md:border-r border-[#E5E5E5] pb-2 md:pb-0 md:pr-4">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const active = pathname?.startsWith(href);
                    return (
                        <li key={href} className="shrink-0">
                            <Link
                                href={href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors ${
                                    active
                                        ? 'bg-[#111] text-white'
                                        : 'text-[#6F6F6F] hover:bg-[#F5F5F5] hover:text-[#111]'
                                }`}
                            >
                                <Icon size={16} strokeWidth={2.25} />
                                {label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}