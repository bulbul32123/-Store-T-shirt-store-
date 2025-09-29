'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { API_URL } from '@/utils/config';

const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);
                // Use the imported API_URL
                const { data } = await axios.get(`${API_URL}/api/products/featured`);
                setProducts(data.products || data);
            } catch (error) {
                console.error('Error fetching featured products:', error);
                setError('Failed to load featured products');
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">No featured products available at the moment.</p>
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

// Dummy data for development fallback
const dummyProducts = [
    {
        _id: '1',
        name: 'Classic Cotton Tee',
        description: 'Comfortable cotton t-shirt for everyday wear',
        price: 24.99,
        images: [{ url: '/images/products/tshirt1.jpg' }],
        category: 'Men',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Black', code: '#000000' }, { name: 'White', code: '#ffffff' }],
        inStock: true,
        stockQuantity: 50,
        ratings: [],
        averageRating: 4.5,
        discount: 0
    },
    {
        _id: '2',
        name: 'Vintage Graphic Tee',
        description: 'Cool vintage design t-shirt',
        price: 29.99,
        images: [{ url: '/images/products/tshirt2.jpg' }],
        category: 'Unisex',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Blue', code: '#0000FF' }, { name: 'Gray', code: '#808080' }],
        inStock: true,
        stockQuantity: 35,
        ratings: [],
        averageRating: 4.2,
        discount: 10
    },
    {
        _id: '3',
        name: 'Athletic Performance Tee',
        description: 'Moisture-wicking athletic t-shirt',
        price: 34.99,
        images: [{ url: '/images/products/tshirt3.jpg' }],
        category: 'Men',
        sizes: ['M', 'L', 'XL'],
        colors: [{ name: 'Red', code: '#FF0000' }, { name: 'Black', code: '#000000' }],
        inStock: true,
        stockQuantity: 20,
        ratings: [],
        averageRating: 4.8,
        discount: 0
    },
    {
        _id: '4',
        name: 'Organic Cotton V-Neck',
        description: 'Eco-friendly organic cotton v-neck t-shirt',
        price: 27.99,
        images: [{ url: '/images/products/tshirt4.jpg' }],
        category: 'Women',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: [{ name: 'Pink', code: '#FFC0CB' }, { name: 'Green', code: '#008000' }],
        inStock: true,
        stockQuantity: 40,
        ratings: [],
        averageRating: 4.6,
        discount: 5
    }
];

export default FeaturedProducts; 