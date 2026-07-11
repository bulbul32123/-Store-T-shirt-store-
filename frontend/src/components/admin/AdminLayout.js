'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaUserAstronaut } from 'react-icons/fa';
import {
  FiHome,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiMessageCircle,
  FiTag,
  FiGrid,
} from 'react-icons/fi';

import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/AdminSidebarContext';

import AdminHeader from './AdminHeader';
import AdminFooter from './footer/AdminFooter';

const sidebarLinks = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: <FiHome className="mr-3 h-5 w-5" />,
  },
  {
    href: '/admin/products',
    label: 'Products',
    icon: <FiBox className="mr-3 h-5 w-5" />,
  },
  {
    href: '/admin/categories',
    label: 'Categories',
    icon: <FiGrid className="mr-3 h-5 w-5" />,
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: <FiShoppingBag className="mr-3 h-5 w-5" />,
  },
  {
    href: '/admin/customers',
    label: 'Customers',
    icon: <FiUsers className="mr-3 h-5 w-5" />,
  },
  {
    href: '/admin/coupons',
    label: 'Coupons',
    icon: <FiTag className="mr-3 h-5 w-5" />,
  },
  {
    href: '/admin/reviews',
    label: 'Reviews',
    icon: <FiTag className="mr-3 h-5 w-5" />,
  },
  {
    href: '/admin/chat',
    label: 'Customer Support',
    icon: <FiMessageCircle className="mr-3 h-5 w-5" />,
  },
  {
    href: '/admin/marketing',
    label: 'Marketing',
    icon: <FiTag className="mr-3 h-5 w-5" />,
  },
  {
    href: '/admin/reports',
    label: 'Reports',
    icon: <FiBarChart2 className="mr-3 h-5 w-5" />,
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: <FiSettings className="mr-3 h-5 w-5" />,
  },
];

export default function AdminLayout({ children }) {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 relative z-[11]">
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-[12] lg:hidden ${
          isMobileOpen ? 'block' : 'hidden'
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => toggleMobileSidebar()}
        />

        <div className="fixed inset-y-0 left-0 z-50 flex w-full max-w-xs flex-col bg-white shadow-xl transition-transform duration-300">
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/admin/dashboard" className="flex items-center">
              <span className="text-xl font-semibold text-gray-900">
                Admin Menu
              </span>
            </Link>

            <button
              onClick={() => toggleMobileSidebar()}
              className="text-gray-500 hover:text-gray-600"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <nav className="space-y-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center rounded-md px-4 py-3 text-sm font-medium ${
                    pathname === link.href
                      ? 'bg-blue-600 text-white'
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
              className="flex w-full items-center rounded-md px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <FiLogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 hidden w-64 flex-col lg:flex">
        <div className="flex flex-grow flex-col overflow-y-auto bg-white shadow-xl">
          <div className="mt-[13px] flex h-16 items-center border-b px-6">
            <Link href="/admin/dashboard" className="flex items-center">
              <span className="pb-2 text-xl font-extrabold text-gray-900">
                T-shirt Admin Panel
              </span>
            </Link>
          </div>

          <div className="flex-1 px-4 gap-4 py-4">
            <nav className="space-y-3">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center rounded-md px-4 py-3 text-sm font-medium ${
                    pathname === link.href
                      ? 'bg-blue-600 text-white'
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
              <span className="mr-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#F5F5F5]">
                {user?.profilePicture?.url ? (
                  <Image
                    src={user.profilePicture.url}
                    alt={user?.name}
                    width={100}
                    height={100}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <FaUserAstronaut
                    size={23}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
              </span>

              <div className="ml-3 truncate">
                <p className="truncate text-sm font-medium text-gray-700">
                  {user?.name || 'Admin'}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-4 flex w-full items-center rounded-md px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <FiLogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto px-2 py-2">
          {children}
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}