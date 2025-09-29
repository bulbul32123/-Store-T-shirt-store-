'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { cartItems } = useCart();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle search submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/products?keyword=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <header
            className={`fixed w-full z-[10] transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/80 backdrop-blur-md py-4'
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold text-blue-600">
                        T-Shirt Store
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className={`font-medium hover:text-blue-600 transition-colors ${pathname === '/' ? 'text-blue-600' : 'text-gray-700'
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/products"
                            className={`font-medium hover:text-blue-600 transition-colors ${pathname === '/products' ? 'text-blue-600' : 'text-gray-700'
                                }`}
                        >
                            Shop
                        </Link>
                        <Link
                            href="/customize"
                            className={`font-medium hover:text-blue-600 transition-colors ${pathname === '/customize' ? 'text-blue-600' : 'text-gray-700'
                                }`}
                        >
                            Customize
                        </Link>
                        <Link
                            href="/about"
                            className={`font-medium hover:text-blue-600 transition-colors ${pathname === '/about' ? 'text-blue-600' : 'text-gray-700'
                                }`}
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className={`font-medium hover:text-blue-600 transition-colors ${pathname === '/contact' ? 'text-blue-600' : 'text-gray-700'
                                }`}
                        >
                            Contact
                        </Link>
                    </nav>

                    {/* Search, Cart, and User */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* Search Form */}
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </form>

                        {/* Cart */}
                        <Link href="/cart" className="relative">
                            <FiShoppingCart className="w-6 h-6 text-gray-700 hover:text-blue-600 transition-colors" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {user ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-1">
                                    <FiUser className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        My Profile
                                    </Link>
                                    <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        My Orders
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link href="/auth/login" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                                <FiUser className="w-6 h-6" />
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-700"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <FiX className="w-6 h-6" />
                        ) : (
                            <FiMenu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t mt-2">
                    <div className="container mx-auto px-4 py-3">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearchSubmit} className="relative mb-4">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </form>

                        {/* Mobile Navigation */}
                        <nav className="flex flex-col space-y-3">
                            <Link
                                href="/"
                                className={`font-medium hover:text-blue-600 transition-colors ${pathname === '/' ? 'text-blue-600' : 'text-gray-700'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/products"
                                className={`font-medium hover:text-blue-600 transition-colors ${pathname === '/products' ? 'text-blue-600' : 'text-gray-700'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Shop
                            </Link>
                            <Link
                                href="/customize"
                                className={`font-medium hover:text-blue-600 transition-colors ${pathname === '/customize' ? 'text-blue-600' : 'text-gray-700'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Customize
                            </Link>
                            <Link
                                href="/about"
                                className={`font-medium hover:text-blue-600 transition-colors ${pathname === '/about' ? 'text-blue-600' : 'text-gray-700'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                About
                            </Link>
                            <Link
                                href="/contact"
                                className={`font-medium hover:text-blue-600 transition-colors ${pathname === '/contact' ? 'text-blue-600' : 'text-gray-700'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contact
                            </Link>
                        </nav>

                        {/* Mobile User Links */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            {user ? (
                                <>
                                    <Link
                                        href="/profile"
                                        className="block py-2 text-gray-700 hover:text-blue-600"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        My Profile
                                    </Link>
                                    <Link
                                        href="/orders"
                                        className="block py-2 text-gray-700 hover:text-blue-600"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        My Orders
                                    </Link>
                                    <Link
                                        href="/cart"
                                        className="block py-2 text-gray-700 hover:text-blue-600"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Cart ({cartItems.length})
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link
                                            href="/dashboard"
                                            className="block py-2 text-gray-700 hover:text-blue-600"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left py-2 text-gray-700 hover:text-blue-600"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="block py-2 text-gray-700 hover:text-blue-600"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        className="block py-2 text-gray-700 hover:text-blue-600"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Register
                                    </Link>
                                    <Link
                                        href="/cart"
                                        className="block py-2 text-gray-700 hover:text-blue-600"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Cart ({cartItems.length})
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header; 