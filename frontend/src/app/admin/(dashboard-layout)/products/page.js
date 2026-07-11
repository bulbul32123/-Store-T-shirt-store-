// admin/products/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { API_URL } from '@/utils/config';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { RiAddLine } from 'react-icons/ri';
import { FiSearch } from 'react-icons/fi';
import Link from 'next/link';
import ProductsTable from '@/components/admin/ProductsTable';
import ProductListSkeleton from '@/components/admin/LoadingSkeletons/ProductListSkeleton';

export default function ProductList() {
    const { user }  = useAuth();
    const router    = useRouter();
    const [products, setProducts]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const [sortField, setSortField]     = useState('name');
    const [sortOrder, setSortOrder]     = useState('asc');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter]     = useState('');
    
    // NEW: Filter states for Name, Price, and Stock
    const [search, setSearch]             = useState('');
    const [minPrice, setMinPrice]         = useState('');
    const [maxPrice, setMaxPrice]         = useState('');
    const [minStock, setMinStock]         = useState('');

    /* ── Fetch ──────────────────────────────────────────────────────── */
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                sortField,
                sortOrder,
            });
            if (statusFilter) params.append('status', statusFilter);
            if (dateFilter)   params.append('dateFilter', dateFilter);
            
            // NEW: Append text, price, and stock parameters to the API request
            if (search)       params.append('search', search);
            if (minPrice)     params.append('minPrice', minPrice);
            if (maxPrice)     params.append('maxPrice', maxPrice);
            if (minStock)     params.append('minStock', minStock);

            const { data } = await axios.get(`${API_URL}/api/products?${params.toString()}`);

            if (data.products) {
                setProducts(data.products);
                setTotalPages(data.totalPages || 1);
            } else {
                setProducts(data || []);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products inventory.');
        } finally {
            setLoading(false);
        }
    };

    // Added the new filter states to the dependency array
    useEffect(() => {
        if (user?.role === 'admin') {
            // Optional debounce can be placed here for the search string if needed
            fetchProducts();
        }
    }, [user, currentPage, sortField, sortOrder, statusFilter, dateFilter, search, minPrice, maxPrice, minStock]);

    /* ── Handlers ───────────────────────────────────────────────────── */
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
        setCurrentPage(1);
    };

    const handleDateFilterChange = (filterOption) => {
        setDateFilter(filterOption);
        setCurrentPage(1);
    };

    const handleEditRedirect = (product) => {
        router.push(`/admin/products/edit/${product._id}`);
    };

    const handleDeleteProduct = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/products/${id}`);
            setProducts(prev => prev.filter(p => p._id !== id));
            toast.success('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error(error.response?.data?.message || 'Failed to delete product');
            throw error;
        }
    };

   // Loading state
if (loading && products.length === 0) {
    return <ProductListSkeleton />;
}

// Empty state
if (!loading && products.length === 0) {
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Products Inventory
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage and monitor your online store items
                    </p>
                </div>

                <Link
                    href="/admin/products/new"
                    className="bg-[#CAEF96] text-black hover:bg-[#CAEF96]/80 px-4 py-2 rounded-md text-sm font-medium flex items-center shadow-sm"
                >
                    <RiAddLine className="mr-1 text-lg" />
                    Add Product
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 text-center py-12 text-gray-500">
                <p className="text-lg font-medium">
                    No products found matching filters
                </p>
            </div>
        </div>
    );
}

return (
    <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Products Inventory
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage and monitor your online store items
                </p>
            </div>

            <Link
                href="/admin/products/new"
                className="bg-[#CAEF96] text-black hover:bg-[#CAEF96]/80 px-4 py-2 rounded-md text-sm font-medium flex items-center shadow-sm"
            >
                <RiAddLine className="mr-1 text-lg" />
                Add Product
            </Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-150 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="relative">
                <label className="block text-xs font-medium text-gray-600 uppercase mb-1">
                    Search Name
                </label>

                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                        type="text"
                        placeholder="Type product name..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>

        <ProductsTable
            products={products}
            onEdit={handleEditRedirect}
            onDelete={handleDeleteProduct}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onStatusChange={handleStatusChange}
            onDateFilterChange={handleDateFilterChange}
            currentStatusFilter={statusFilter}
            currentDateFilter={dateFilter}
        />
    </div>
);

}