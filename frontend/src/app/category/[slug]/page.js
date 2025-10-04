'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/utils/config';
import ProductCard from '@/components/products/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function CategoryPage() {
    const { slug } = useParams();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(
                    `${API_URL}/api/categories/${slug}/products?page=${currentPage}`
                );

                setCategory(data.category);
                setProducts(data.products);
                setTotalPages(data.pagination.totalPages);
            } catch (error) {
                console.error('Error fetching category products:', error);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProducts();
    }, [slug, currentPage]);

    if (loading) {
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="large" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Breadcrumb
                items={[
                    { label: 'Home', href: '/' },
                    { label: 'Categories', href: '/categories' },
                    { label: category?.name, href: `/category/${category?.slug}` }
                ]}
            />

            <div className="my-8">
                <h1 className="text-3xl font-bold text-gray-900">{category?.name}</h1>
                {category?.description && (
                    <p className="mt-2 text-gray-600">{category.description}</p>
                )}
            </div>

            {products.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-12">
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 border rounded-md ${currentPage === 1
                                            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 border rounded-md ${currentPage === page
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 border rounded-md ${currentPage === totalPages
                                            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="py-12 text-center">
                    <p className="text-gray-600">No products found in this category.</p>
                </div>
            )}
        </div>
    );
} 