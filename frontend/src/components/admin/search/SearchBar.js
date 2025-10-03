"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const SearchBar = ({ inputRef }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    products: [],
    orders: [],
    customers: [],
    categories: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Debounce search query
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim() && query.length > 1) {
        performSearch(query);
      } else {
        setResults({ products: [], orders: [], customers: [], categories: [] });
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock search function - replace with your actual API calls
  const performSearch = async (searchTerm) => {
    setIsLoading(true);
    try {
      // Replace these with your actual API endpoints
      const [productsRes, ordersRes, customersRes, categoriesRes] = await Promise.all([
        searchProducts(searchTerm),
        searchOrders(searchTerm),
        searchCustomers(searchTerm),
        searchCategories(searchTerm)
      ]);

      setResults({
        products: productsRes,
        orders: ordersRes,
        customers: customersRes,
        categories: categoriesRes
      });

      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock API functions - replace with your actual API calls
  const searchProducts = async (term) => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?search=${term}`
      );
      // Assuming API returns { products: [] }
      return data.products?.slice(0, 5) || [];
    } catch (error) {
      console.error("Product search failed:", error.response?.data || error.message);
      return [];
    }
  };

  const searchOrders = async (term) => {
    await new Promise(resolve => setTimeout(resolve, 100));

    const mockOrders = [
      { id: 'ORD001', customerName: 'John Doe', customerEmail: 'john@email.com', status: 'shipped', total: 89.99 },
      { id: 'ORD002', customerName: 'Jane Smith', customerEmail: 'jane@email.com', status: 'pending', total: 149.99 },
      { id: 'ORD003', customerName: 'Bob Johnson', customerEmail: 'bob@email.com', status: 'delivered', total: 299.99 }
    ];

    return mockOrders.filter(order =>
      order.id.toLowerCase().includes(term.toLowerCase()) ||
      order.customerName.toLowerCase().includes(term.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(term.toLowerCase()) ||
      order.status.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 5);
  };

  const searchCustomers = async (term) => {
    await new Promise(resolve => setTimeout(resolve, 100));

    const mockCustomers = [
      { id: 1, name: 'John Doe', email: 'john@email.com', phone: '+1234567890', orders: 5 },
      { id: 2, name: 'Jane Smith', email: 'jane@email.com', phone: '+1234567891', orders: 3 },
      { id: 3, name: 'Bob Johnson', email: 'bob@email.com', phone: '+1234567892', orders: 8 }
    ];

    return mockCustomers.filter(customer =>
      customer.name.toLowerCase().includes(term.toLowerCase()) ||
      customer.email.toLowerCase().includes(term.toLowerCase()) ||
      customer.phone.includes(term)
    ).slice(0, 5);
  };

  const searchCategories = async (term) => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories?search=${term}`
      );
      // Assuming API returns { categories: [] }
      return data.categories?.slice(0, 5) || [];
    } catch (error) {
      console.error("Category search failed:", error.response?.data || error.message);
      return [];
    }
  };

  // Flatten all results for keyboard navigation
  const getAllResults = () => {
    const all = [];
    if (results.products.length) {
      all.push({ type: 'section', label: 'Products' });
      results.products.forEach(item => all.push({ type: 'product', data: item }));
    }
    if (results.orders.length) {
      all.push({ type: 'section', label: 'Orders' });
      results.orders.forEach(item => all.push({ type: 'order', data: item }));
    }
    if (results.customers.length) {
      all.push({ type: 'section', label: 'Customers' });
      results.customers.forEach(item => all.push({ type: 'customer', data: item }));
    }
    if (results.categories.length) {
      all.push({ type: 'section', label: 'Categories' });
      results.categories.forEach(item => all.push({ type: 'category', data: item }));
    }
    return all;
  };

  const handleKeyDown = (e) => {
    const allResults = getAllResults().filter(item => item.type !== 'section');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < allResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev > 0 ? prev - 1 : allResults.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && allResults[selectedIndex]) {
        handleResultClick(allResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (result) => {
    const { type, data } = result;

    // Navigate based on result type
    switch (type) {
      case 'product':
        router.push(`/admin/products/${data.id}`);
        break;
      case 'order':
        router.push(`/admin/orders/${data.id}`);
        break;
      case 'customer':
        router.push(`/admin/customers/${data.id}`);
        break;
      case 'category':
        router.push(`/admin/categories/${data.id}`);
        break;
    }

    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'product':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        );
      case 'order':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 9a1 1 0 112 0 1 1 0 01-2 0zm6 0a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
          </svg>
        );
      case 'customer':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      case 'category':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderResult = (result, index) => {
    const { type, data } = result;
    const isSelected = selectedIndex === index;

    // Fix for undefined keys
    const uniqueKey = `${type}-${data.id || data._id || index}`;

    return (
      <div
        key={uniqueKey}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected
            ? 'bg-blue-50 border-l-2 border-blue-500'
            : 'hover:bg-gray-50'
          }`}
        onClick={() => handleResultClick(result)}
      >
        {getResultIcon(type)}
        <div className="flex-1 min-w-0">
          {type === 'product' && (
            <>
              <div className="font-medium text-gray-900 truncate">{data.name}</div>
              <div className="text-sm text-gray-500">
                SKU: {data.sku} • {data.category?.name || 'No category'} • Stock: {data.stock}
              </div>
            </>
          )}
          {type === 'order' && (
            <>
              <div className="font-medium text-gray-900">{data.id}</div>
              <div className="text-sm text-gray-500">
                {data.customerName} • {data.status} • ${data.total}
              </div>
            </>
          )}
          {type === 'customer' && (
            <>
              <div className="font-medium text-gray-900">{data.name}</div>
              <div className="text-sm text-gray-500">
                {data.email} • {data.orders} orders
              </div>
            </>
          )}
          {type === 'category' && (
            <>
              <div className="font-medium text-gray-900">{data.name}</div>
              <div className="text-sm text-gray-500">
                {data.products || 0} products
              </div>
            </>
          )}
        </div>
      </div>
    );
  };


  const hasResults = results.products.length || results.orders.length || results.customers.length || results.categories.length;
  console.log(results.products);


  return (
    <div className="hidden lg:block relative" ref={dropdownRef}>
      <form onSubmit={e => e.preventDefault()}>
        <div className="relative">
          <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
            <svg
              className="fill-gray-500"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                fill=""
              />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, orders, customers..."
            className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 xl:w-[430px]"
          />

          {isLoading && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}

          <button
            type="button"
            className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500"
          >
            <span>⌘</span>
            <span>K</span>
          </button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-500">Searching...</span>
            </div>
          ) : hasResults ? (
            <div>
              {/* Products Section */}
              {results.products.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Products</h3>
                  </div>
                  {results.products.map((product, index) =>
                    renderResult({ type: 'product', data: product }, index)
                  )}
                </>
              )}

              {/* Orders Section */}
              {results.orders.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Orders</h3>
                  </div>
                  {results.orders.map((order, index) =>
                    renderResult({ type: 'order', data: order }, results.products.length + index)
                  )}
                </>
              )}

              {/* Customers Section */}
              {results.customers.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customers</h3>
                  </div>
                  {results.customers.map((customer, index) =>
                    renderResult({ type: 'customer', data: customer }, results.products.length + results.orders.length + index)
                  )}
                </>
              )}

              {/* Categories Section */}
              {results.categories.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categories</h3>
                  </div>
                  {results.categories.map((category, index) =>
                    renderResult({ type: 'category', data: category }, results.products.length + results.orders.length + results.customers.length + index)
                  )}
                </>
              )}
            </div>
          ) : query.length > 1 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              No results found for `{query}`
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;