'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { API_URL } from '@/utils/config';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { RiArrowLeftLine, RiAlertLine } from 'react-icons/ri';
import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProduct({ params }) {
    const { id } = params;
    const { user } = useAuth();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('No authentication token found');
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                // Fetch product and categories in parallel
                const [productResponse, categoriesResponse] = await Promise.all([
                    axios.get(`${API_URL}/api/products/${id}`, config),
                    axios.get(`${API_URL}/api/categories`, config)
                ]);

                setProduct(productResponse.data.product);
                setCategories(categoriesResponse.data.categories);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.response?.data?.message || 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchData();
        }
    }, [user, id]);

    const handleSubmit = async (formData) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.put(`${API_URL}/api/products/${id}`, formData, config);

            toast.success('Product updated successfully');
            router.push('/admin/products');
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error(error.response?.data?.message || 'Failed to update product');
            throw error; // Re-throw to be caught by the form component
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="space-y-4">
                <div className="flex items-center">
                    <Link href="/admin/products" className="flex items-center text-gray-600 hover:text-gray-900">
                        <RiArrowLeftLine className="mr-2" />
                        Back to Products
                    </Link>
                </div>

                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold flex items-center">
                        <RiAlertLine className="mr-2" /> Error
                    </h2>
                    <p>{error || 'Product not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>

                <Link
                    href="/admin/products"
                    className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <RiArrowLeftLine className="mr-2" />
                    Back to Products
                </Link>
            </div>

            <ProductForm
                initialData={{
                    ...product,
                    category: product.category?._id || product.category
                }}
                categories={categories}
                onSubmit={handleSubmit}
                buttonText="Update Product"
            />
        </div>
    );
} 