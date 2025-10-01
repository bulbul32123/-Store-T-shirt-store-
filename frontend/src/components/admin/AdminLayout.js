'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    FiHome, FiBox, FiShoppingBag, FiUsers, FiBarChart2,
    FiSettings, FiMenu, FiX, FiLogOut, FiMessageCircle,
    FiTag, FiGrid
} from 'react-icons/fi';
import AdminHeader from './AdminHeader';
import { useSidebar } from '@/context/SidebarContext';
import AdminFooter from './footer/AdminFooter';

const sidebarLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <FiHome className="mr-3 h-5 w-5" /> },
    { href: '/admin/products', label: 'Products', icon: <FiBox className="mr-3 h-5 w-5" /> },
    { href: '/admin/categories', label: 'Categories', icon: <FiGrid className="mr-3 h-5 w-5" /> },
    { href: '/admin/orders', label: 'Orders', icon: <FiShoppingBag className="mr-3 h-5 w-5" /> },
    { href: '/admin/customers', label: 'Customers', icon: <FiUsers className="mr-3 h-5 w-5" /> },
    { href: '/admin/chat', label: 'Customer Support', icon: <FiMessageCircle className="mr-3 h-5 w-5" /> },
    { href: '/admin/marketing', label: 'Marketing', icon: <FiTag className="mr-3 h-5 w-5" /> },
    { href: '/admin/reports', label: 'Reports', icon: <FiBarChart2 className="mr-3 h-5 w-5" /> },
    { href: '/admin/settings', label: 'Settings', icon: <FiSettings className="mr-3 h-5 w-5" /> },
];

export default function AdminLayout({ children }) {
    const { isMobileOpen, toggleMobileSidebar } = useSidebar();
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 relative z-[11]">
            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-[12] lg:hidden ${isMobileOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => toggleMobileSidebar()}></div>

                <div className="fixed inset-y-0 left-0 flex flex-col z-50 max-w-xs w-full bg-white shadow-xl transform transition-transform duration-300">
                    <div className="flex items-center justify-between h-16 px-6 border-b">
                        <Link href="/admin/dashboard" className="flex items-center">
                            <span className="text-xl font-semibold text-gray-900">Admin Menu</span>
                        </Link>
                        <button
                            onClick={() => toggleMobileSidebar()}
                            className="text-gray-500 hover:text-gray-600"
                        >
                            <FiX className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 px-4">
                        <nav className="space-y-1">
                            {sidebarLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${pathname === link.href
                                        ? 'text-white bg-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="border-t p-4">
                        <button
                            onClick={logout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                            <FiLogOut className="mr-3 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex flex-col flex-grow bg-white shadow-xl overflow-y-auto">
                    <div className="flex items-center h-16 px-6 mt-[13px] border-b">
                        <Link href="/admin/dashboard" className="flex items-center">
                            <span className="text-xl font-extrabold pb-2 text-gray-900">T-shirt Admin Panel</span>
                        </Link>
                    </div>

                    <div className="flex-1 py-4 px-4">
                        <nav className="space-y-1">
                            {sidebarLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${pathname === link.href
                                        ? 'text-white bg-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="border-t p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center">
                                <span className="text-blue-700 font-semibold text-lg">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                </span>
                            </div>
                            <div className="ml-3 truncate">
                                <p className="text-sm font-medium text-gray-700 truncate">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@example.com'}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="mt-4 flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                            <FiLogOut className="mr-3 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:pl-64 flex flex-col flex-1">
                {/* Top Navbar */}
                <AdminHeader />

                {/* Main content */}
                <main className="flex-1 overflow-y-auto px-2 py-2">
                    {children}
                </main>
                <AdminFooter />
            </div>
        </div>
    );
} 