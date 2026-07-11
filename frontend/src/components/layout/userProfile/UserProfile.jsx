'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { GrUserAdmin } from "react-icons/gr";
import { FaUserAstronaut, FaHeart, FaShoppingCart, FaCog, FaSignOutAlt, FaBoxOpen } from 'react-icons/fa'
// 1. Import the useAuth hook
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext';
import { useWatchlist } from '@/context/WatchlistContext';

export default function UserProfile({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { syncNow: syncCartNow } = useCart();
const { syncNow: syncWatchlistNow } = useWatchlist();
    const { logout,hasRole } = useAuth();

    const handleLogout = async () => {
        setIsOpen(false);
        try {
            // 3. Call your context's logout function
            await Promise.all([syncCartNow(), syncWatchlistNow()]);
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
const isAdmin = hasRole('admin'); // Check if the user has the 'admin' role

    return (
        <div className="relative z-40" ref={dropdownRef}>
            {/* 4. Added safe navigation (?.) to prevent crashes if user is briefly null */}
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)} // Toggle dropdown cleanly on click
                onMouseEnter={() => setIsOpen(true)}
            >
                <span className='text-base flexCenter gap-2'>Hi, {" "}<p className={`${isAdmin&& 'text-primary'}`}>{user?.name || 'User'}</p></span>
               <div className="h-7 w-7 rounded-full bg-[#F5F5F5] overflow-hidden flex items-center justify-center ">
                {user?.profilePicture?.url ? (
                    <img src={user.profilePicture.url} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                     <FaUserAstronaut size={23} />
                )}
            </div>
            </div>

            {/* Dropdown Menu */}
            <div
                className={`absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg py-1 z-50 transition-all duration-300 transform origin-top ${isOpen
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-[-10px] scale-95 pointer-events-none'
                    }`}
            >
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <p className="font-bold">{user?.name || 'User'}&apos;s Account</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                {isAdmin && (
                    <Link href="/admin/dashboard" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                        <GrUserAdmin className="text-gray-500" />
                        Admin Dashboard
                    </Link>
                )}
                <Link href="/profile/account" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <FaUserAstronaut className="text-gray-500" />
                    Profile
                </Link>

                <Link href="/orders" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <FaBoxOpen className="text-gray-500" />
                    Orders
                </Link>

                <Link href="/watchlist" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <FaHeart className="text-gray-500" />
                    WatchList
                </Link>

                <Link href="/cart" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <FaShoppingCart className="text-gray-500" />
                    Cart
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                >
                    <FaSignOutAlt className="text-red-500" />
                    Logout
                </button>
            </div>
        </div>
    )
}