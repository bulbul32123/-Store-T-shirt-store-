'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const RelatedProducts = ({ category, currentProductId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/products?category=${category}&limit=4`
                );

                // Filter out the current product and limit to 4 products
                const filteredProducts = data.products
                    .filter(product => product._id !== currentProductId)
                    .slice(0, 4);

                setProducts(filteredProducts);
            } catch (error) {
                console.error('Error fetching related products:', error);
                setError('Failed to load related products');
            } finally {
                setLoading(false);
            }
        };

        if (category && currentProductId) {
            fetchRelatedProducts();
        }
    }, [category, currentProductId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-6">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-gray-500">No related products found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    );
};

export default RelatedProducts; 