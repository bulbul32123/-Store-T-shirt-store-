'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiBox, FiShoppingBag, FiUsers, FiSettings, FiFileText, FiMessageSquare } from 'react-icons/fi';

const AdminSidebar = () => {
  const pathname = usePathname();
  
  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: <FiHome className="w-5 h-5" /> 
    },
    { 
      name: 'Products', 
      href: '/admin/products', 
      icon: <FiBox className="w-5 h-5" /> 
    },
    { 
      name: 'Orders', 
      href: '/admin/orders', 
      icon: <FiShoppingBag className="w-5 h-5" /> 
    },
    { 
      name: 'Customers', 
      href: '/admin/customers', 
      icon: <FiUsers className="w-5 h-5" /> 
    },
    { 
      name: 'Categories', 
      href: '/admin/categories', 
      icon: <FiFileText className="w-5 h-5" /> 
    },
    {
      name: 'Chat Support',
      href: '/admin/chat',
      icon: <FiMessageSquare className="w-5 h-5" />
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: <FiSettings className="w-5 h-5" /> 
    }
  ];
  
  return (
    <div className="w-64 bg-white h-screen shadow-md flex flex-col">
      <div className="p-5 border-b">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="py-4">
          {navItems.map((item) => (
            <li key={item.name} className="px-5 py-2">
              <Link 
                href={item.href}
                className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                  pathname === item.href 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-5 border-t">
        <p className="text-sm text-gray-600">© 2023 T-Shirt Store</p>
      </div>
    </div>
  );
};

export default AdminSidebar; 