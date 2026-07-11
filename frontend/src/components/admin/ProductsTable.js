'use client';
import { useState, useRef, useEffect } from 'react';
import {
    FiEdit2, FiTrash2, FiEye,
    FiChevronUp, FiChevronDown,
    FiArrowLeft, FiArrowRight,
    FiCalendar, FiClock, FiFilter
} from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/utils/formatters';
import ConfirmModal from '@/components/common/ConfirmModal';


export default function ProductsTable({
    products,
    onEdit,
    onDelete,
    sortField,
    sortOrder,
    currentPage,
    totalPages,
    onPageChange,
    onStatusChange,
    onDateFilterChange,
    currentStatusFilter,
    currentDateFilter,
}) {
    const [productToDelete, setProductToDelete]   = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting]             = useState(false);
    const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
    const [isDateFilterOpen, setIsDateFilterOpen]     = useState(false);

    const statusDropdownRef = useRef(null);
    const dateFilterRef     = useRef(null);

    /* ── Close dropdowns on outside click ─────────────────────────── */
    useEffect(() => {
        function handleClickOutside(event) {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setIsStatusFilterOpen(false);
            }
            if (dateFilterRef.current && !dateFilterRef.current.contains(event.target)) {
                setIsDateFilterOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /* ── Filter handlers ───────────────────────────────────────────── */
    // FIX: was calling onStatusChange(productId, newStatus) — productId was actually the
    //      status string and newStatus was undefined. Now passes just the status value.
    const handleStatusFilterChange = (newStatus) => {
        onStatusChange?.(newStatus);
        setIsStatusFilterOpen(false);
    };

    const handleDateFilterChange = (filter) => {
        onDateFilterChange?.(filter);
        setIsDateFilterOpen(false);
    };

    /* ── Sort icon helper ──────────────────────────────────────────── */
    const SortIcon = ({ field }) => {
        if (sortField !== field) return <FiChevronDown className="ml-1 opacity-30" />;
        return sortOrder === 'asc'
            ? <FiChevronUp   className="ml-1" />
            : <FiChevronDown className="ml-1" />;
    };

    /* ── Date formatting helpers ───────────────────────────────────── */
    const getRelativeTimeString = (dateString) => {
        const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
        const min  = 60, hr = 3600, day = 86400,
              wk   = 604800, mo = 2592000, yr = 31536000;
        if (diff < min)  return 'just now';
        if (diff < hr)   { const n = Math.floor(diff / min);  return `${n} ${n===1?'minute':'minutes'} ago`; }
        if (diff < day)  { const n = Math.floor(diff / hr);   return `${n} ${n===1?'hour':'hours'} ago`; }
        if (diff < wk)   { const n = Math.floor(diff / day);  return `${n} ${n===1?'day':'days'} ago`; }
        if (diff < mo)   { const n = Math.floor(diff / wk);   return `${n} ${n===1?'week':'weeks'} ago`; }
        if (diff < yr)   { const n = Math.floor(diff / mo);   return `${n} ${n===1?'month':'months'} ago`; }
        const n = Math.floor(diff / yr); return `${n} ${n===1?'year':'years'} ago`;
    };

    const formatDate = (dateString) => {
        const d     = new Date(dateString);
        const month = d.toLocaleString('en-US', { month: 'short' });
        const hours = d.getHours() % 12 || 12;
        const mins  = d.getMinutes().toString().padStart(2, '0');
        const ampm  = d.getHours() >= 12 ? 'PM' : 'AM';
        return `${d.getDate()} ${month} ${d.getFullYear()}, ${hours}:${mins} ${ampm}`;
    };

    /* ── Delete handlers ───────────────────────────────────────────── */
    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        try {
            await onDelete(productToDelete._id);
        } catch (err) {
            console.error('Error deleting product:', err);
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        }
    };

    const cancelDelete = () => {
        if (isDeleting) return;
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
    };

    /* ── Active filter badge (shown inside header button) ─────────── */
    const ActiveFilterBadge = ({ value }) =>
        value ? (
            <span className="ml-1 bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded capitalize leading-none">
                {value}
            </span>
        ) : null;

    /* ──────────────────────────────────────────────────────────────── */
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                isLoading={isDeleting}
            />

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            {/* ── Name ── */}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button className="flex items-center focus:outline-none">
                                    Name 
                                </button>
                            </th>

                            {/* ── Price ── */}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button className="flex items-center focus:outline-none">
                                    Price 
                                </button>
                            </th>

                            {/* ── Stock ── */}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                               
<button  className="flex items-center focus:outline-none">
    Stock 
</button>
                            </th>

                            {/* ── Sales ── */}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button className="flex items-center focus:outline-none">
                                    Sales
                                </button>
                            </th>


                            {/* ── Date Added filter ── FIX: ref now wraps only this th's content */}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="relative" ref={dateFilterRef}>
                                    <button
                                        
                                        className="flex items-center gap-1 focus:outline-none"
                                    >
                                        Date Added
                                        <ActiveFilterBadge value={currentDateFilter} />
                                    </button>
                                </div>
                            </th>

                            {/* ── Actions ── */}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => {
                            const displayImage =
                                product.colors?.find(c => c.images?.length > 0)?.images[0]?.url ?? null;
                            return (
                                <tr key={product._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-md overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={displayImage || '/images/product-placeholder.png'}
                                                    alt={product.name}
                                                    width={32}
                                                    height={32}
                                                    className="h-8 w-8 object-cover"
                                                />
                                            </div>
                                            <p className="ml-3 text-sm font-medium text-gray-900 truncate max-w-xs">
                                                {product.name}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(product.price)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {product.stock} units
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <span className="font-medium">{product.sales ?? 0}</span>
                                        <span className="ml-1 text-xs text-gray-400">units</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-900">{formatDate(product.createdAt)}</span>
                                            <span className="text-[10px] text-gray-500">{getRelativeTimeString(product.createdAt)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onEdit(product)}
                                                className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                                title="Edit"
                                            >
                                                <FiEdit2 className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(product)}
                                                className="text-red-600 hover:text-red-900 cursor-pointer"
                                                title="Delete"
                                            >
                                                <FiTrash2 className="h-5 w-5" />
                                            </button>
                                            <Link
                                                href={`/product/${product._id}`}
                                                target="_blank"
                                                className="text-green-600 hover:text-green-900 cursor-pointer"
                                                title="View"
                                            >
                                                <FiEye className="h-5 w-5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            <div className="mt-4 flex justify-end">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <span className="sr-only">Previous</span>
                        <FiArrowLeft className="h-5 w-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                page === currentPage
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <span className="sr-only">Next</span>
                        <FiArrowRight className="h-5 w-5" />
                    </button>
                </nav>
            </div>
        </div>
    );
}