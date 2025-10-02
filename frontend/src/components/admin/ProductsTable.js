'use client';

import { useState, useRef, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiChevronUp, FiChevronDown, FiArrowLeft, FiArrowRight, FiCalendar, FiClock } from 'react-icons/fi';
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
    onSort,
    currentPage,
    totalPages,
    onPageChange,
    onStatusChange,
    onDateFilterChange
}) {
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(null); // null or product ID
    const statusDropdownRef = useRef(null);
    const dateFilterRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                statusDropdownRef.current &&
                !statusDropdownRef.current.contains(event.target)
            ) {
                setStatusDropdownOpen(null);
            }
    
            if (
                dateFilterRef.current &&
                !dateFilterRef.current.contains(event.target)
            ) {
                setIsDateFilterOpen(false);
            }
        } 
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); // Working on Products Status Dropdown
    

    const renderStatusBadge = (status, productId) => {
        const productStatus = status || 'active';

        let bgColor, textColor;

        switch (productStatus.toLowerCase()) {
            case 'pending':
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-800';
                break;
            case 'inactive':
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
                break;
            case 'active':
            default:
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                break;
        }

        return (
            <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => setStatusDropdownOpen(statusDropdownOpen === productId ? null : productId)}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} capitalize hover:opacity-80 transition-opacity`}
            >
              {productStatus}
              <FiChevronDown className="ml-1" />
            </button>
          
            {statusDropdownOpen === productId && (
              <div className="absolute z-10 mt-1 w-32 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-green-800 hover:bg-green-100"
                  onClick={() => handleStatusChange(productId, 'active')}
                >
                  Active
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-yellow-800 hover:bg-yellow-100"
                  onClick={() => handleStatusChange(productId, 'pending')}
                >
                  Pending
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-red-800 hover:bg-red-100"
                  onClick={() => handleStatusChange(productId, 'inactive')}
                >
                  Inactive
                </button>
              </div>
            )}
          </div>
          
        );
    };

    const handleStatusChange = (productId, newStatus) => {
        if (onStatusChange) {
            onStatusChange(productId, newStatus);
        }
        setStatusDropdownOpen(false);
    };

    const handleDateFilterChange = (filter) => {
        if (onDateFilterChange) {
            onDateFilterChange(filter);
        }
        setIsDateFilterOpen(false);
    };

    const renderSortIcon = (field) => {
        if (sortField === field) {
            return sortOrder === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
        }
        return null;
    };

    const getRelativeTimeString = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        const minute = 60;
        const hour = minute * 60;
        const day = hour * 24;
        const week = day * 7;
        const month = day * 30;
        const year = day * 365;

        if (diffInSeconds < minute) {
            return 'just now';
        } else if (diffInSeconds < hour) {
            const minutes = Math.floor(diffInSeconds / minute);
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffInSeconds < day) {
            const hours = Math.floor(diffInSeconds / hour);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        } else if (diffInSeconds < week) {
            const days = Math.floor(diffInSeconds / day);
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        } else if (diffInSeconds < month) {
            const weeks = Math.floor(diffInSeconds / week);
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        } else if (diffInSeconds < year) {
            const months = Math.floor(diffInSeconds / month);
            return `${months} ${months === 1 ? 'month' : 'months'} ago`;
        } else {
            const years = Math.floor(diffInSeconds / year);
            return `${years} ${years === 1 ? 'year' : 'years'} ago`;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        const hours = date.getHours() % 12 || 12;
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

        return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteProduct = async () => {
        if (productToDelete) {
            setIsDeleting(true);
            try {
                await onDelete(productToDelete._id);
            } catch (error) {
                console.error("Error deleting product:", error);
            } finally {
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
            }
        }
    };

    const cancelDelete = () => {
        if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={cancelDelete}
                onConfirm={confirmDeleteProduct}
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    onClick={() => onSort('name')}
                                    className="flex items-center focus:outline-none"
                                >
                                    Name {sortOrder === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    onClick={() => onSort('price')}
                                    className="flex items-center focus:outline-none"
                                >
                                    Price {renderSortIcon('price')}
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    onClick={() => onSort('stockQuantity')}
                                    className="flex items-center focus:outline-none"
                                >
                                    Stock {renderSortIcon('stockQuantity')}
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    onClick={() => onSort('sales')}
                                    className="flex items-center focus:outline-none"
                                >
                                    Sales {renderSortIcon('sales')}
                                </button>
                            </th>
                            <th className="px-4 py-3 relative text-left  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div

                                    className="flex items-center focus:outline-none relative cur" ref={statusDropdownRef}
                                >
                                    <button onClick={() => setStatusDropdownOpen(!statusDropdownOpen)} className="cursor-pointer">
                                        Status
                                    </button>

                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="relative flex items-center">
                                    <button
                                        className="flex items-center focus:outline-none mr-1"
                                    >
                                        Date Added
                                    </button>

                                    <div className="" ref={dateFilterRef}>
                                        <button
                                            className="text-gray-500 cursor-pointer hover:text-gray-700 focus:outline-none"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsDateFilterOpen(!isDateFilterOpen);
                                            }}
                                        >
                                            <FiCalendar className="h-3 w-3" />
                                        </button>
                                    </div>

                                </div>
                                {isDateFilterOpen && (
                                    <div className="absolute z-10 right-40 mt-1 w-40 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Filter by</div>
                                        <button
                                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => handleDateFilterChange('')}
                                        >
                                            <FiCalendar className="mr-2" /> All time
                                        </button>
                                        <button
                                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => handleDateFilterChange('lastHour')}
                                        >
                                            <FiClock className="mr-2" /> Last hour
                                        </button>
                                        <button
                                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => handleDateFilterChange('today')}
                                        >
                                            <FiCalendar className="mr-2" /> Added today
                                        </button>
                                        <button
                                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => handleDateFilterChange('week')}
                                        >
                                            <FiCalendar className="mr-2" /> Last week
                                        </button>
                                        <button
                                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => handleDateFilterChange('month')}
                                        >
                                            <FiCalendar className="mr-2" /> Last month
                                        </button>
                                    </div>
                                )}
                                {statusDropdownOpen && (

                                    <div
                                        className="absolute z-10 right-80 mt-5 w-32 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
                                    >
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-green-800 hover:bg-green-100"
                                            onClick={() => handleStatusChange('active')}
                                        >
                                            Active
                                        </button>
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-yellow-800 hover:bg-yellow-100"
                                            onClick={() => handleStatusChange('pending')}
                                        >
                                            Pending
                                        </button>
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-red-800 hover:bg-red-100"
                                            onClick={() => handleStatusChange('inactive')}
                                        >
                                            Inactive
                                        </button>
                                    </div>
                                )}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-md overflow-hidden">
                                            <Image
                                                src={product.images[0]?.url || '/images/product-placeholder.png'}
                                                alt={product.name}
                                                width={32}
                                                height={32}
                                                className="h-8 w-8 object-cover"
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{product.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.price)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm rounded-md text-gray-500">
                                    <p>{product.stock} units</p>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <span className="font-medium">{product.sales || 0}</span>
                                        <span className="ml-1 text-xs text-gray-400">units</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {product.status}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-900">{formatDate(product.createdAt)}</span>
                                        <span className="text-[10px] text-gray-500">{getRelativeTimeString(product.createdAt)}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center justify-start gap-2">
                                        <button
                                            onClick={() => onEdit(product)}
                                            className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                        >
                                            <FiEdit2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(product)}
                                            className="text-red-600 hover:text-red-900 cursor-pointer"
                                        >
                                            <FiTrash2 className="h-5 w-5" />
                                        </button>
                                        <Link
                                            href={`/product/${product._id}`}
                                            target="_blank"
                                            className="text-green-600 hover:text-green-900 cursor-pointer"
                                        >
                                            <FiEye className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-end">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                        <span className="sr-only">Previous</span>
                        <FiArrowLeft className="h-5 w-5" aria-hidden="true" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${page === currentPage ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                        <span className="sr-only">Next</span>
                        <FiArrowRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                </nav>
            </div>
        </div>
    );
}