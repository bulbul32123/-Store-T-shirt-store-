"use client";
import ConfirmModal from "@/components/common/ConfirmModal";
import { formatCurrency } from "@/utils/formatters";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiEdit2,
  FiEye,
  FiTrash2,
} from "react-icons/fi";

export default function ProductsTable({
  products,
  onEdit,
  onDelete,
  currentPage,
  bannerProductId,
  totalPages,
  onPageChange,
  heroProductIds,
}) {
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getRelativeTimeString = (dateString) => {
    const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
    const min = 60,
      hr = 3600,
      day = 86400,
      wk = 604800,
      mo = 2592000,
      yr = 31536000;
    if (diff < min) return "just now";
    if (diff < hr) {
      const n = Math.floor(diff / min);
      return `${n} ${n === 1 ? "minute" : "minutes"} ago`;
    }
    if (diff < day) {
      const n = Math.floor(diff / hr);
      return `${n} ${n === 1 ? "hour" : "hours"} ago`;
    }
    if (diff < wk) {
      const n = Math.floor(diff / day);
      return `${n} ${n === 1 ? "day" : "days"} ago`;
    }
    if (diff < mo) {
      const n = Math.floor(diff / wk);
      return `${n} ${n === 1 ? "week" : "weeks"} ago`;
    }
    if (diff < yr) {
      const n = Math.floor(diff / mo);
      return `${n} ${n === 1 ? "month" : "months"} ago`;
    }
    const n = Math.floor(diff / yr);
    return `${n} ${n === 1 ? "year" : "years"} ago`;
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const month = d.toLocaleString("en-US", { month: "short" });
    const hours = d.getHours() % 12 || 12;
    const mins = d.getMinutes().toString().padStart(2, "0");
    const ampm = d.getHours() >= 12 ? "PM" : "AM";
    return `${d.getDate()} ${month} ${d.getFullYear()}`;
  };

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
      console.error("Error deleting product:", err);
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

  return (
    <div className="bg-white p-4 rounded-lg border">
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button className="flex items-center focus:outline-none">
                  Name
                </button>
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button className="flex items-center focus:outline-none">
                  Price
                </button>
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button className="flex items-center focus:outline-none">
                  Stock
                </button>
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button className="flex items-center focus:outline-none">
                  Sales
                </button>
              </th>

              <th className="px-4 py-3 text-xs font-medium text-gray-500 capitalize whitespace-nowrap text-left">
                On Carousel
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Banner
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const displayImage =
                product.colors?.find((c) => c.images?.length > 0)?.images[0]
                  ?.url ?? null;
              return (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            displayImage || "/images/product-placeholder.png"
                          }
                          alt={product.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 object-cover"
                        />
                      </div>
                      <p
                        className="ml-3 text-sm font-medium text-gray-900"
                        title={product.name} /* Shows the full name on hover */
                      >
                        {product.name.length > 20
                          ? `${product.name.slice(0, 20)}...`
                          : product.name}
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
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        heroProductIds.has(product._id)
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {heroProductIds.has(product._id) ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bannerProductId === product._id
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {bannerProductId === product._id ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-900">
                        {formatDate(product.createdAt)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {getRelativeTimeString(product.createdAt)}
                      </span>
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
        <nav
          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
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
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:bg-gray-50"
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
