'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);
    const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
    const [selectedColor, setSelectedColor] = useState(
        product.colors.length > 0 ? product.colors[0].name : 'Default'
    );

    // Calculate discount price if applicable
    const discountedPrice = product.discount
        ? product.price - (product.price * product.discount) / 100
        : null;

    // Add to wishlist
    const addToWishlist = async () => {
        try {
            if (!user) {
                toast.error('Please login to add items to your wishlist');
                return;
            }

            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/wishlist`,
                { productId: product._id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.success('Added to wishlist!');
        } catch (error) {
            console.error('Add to wishlist error:', error);
            toast.error(error.response?.data?.message || 'Failed to add to wishlist');
        }
    };

    // Handle quick add to cart
    const handleQuickAddToCart = () => {
        if (!product.inStock || product.stockQuantity === 0) {
            toast.error('This product is out of stock');
            return;
        }

        addToCart(product, 1, selectedSize, selectedColor);
    };

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Product Image */}
            <div className="relative h-64 overflow-hidden">
                <Link href={`/product/${product._id}`}>
                    <img
                        src={product.images && product.images.length > 0 ? product.images[0].url : '/images/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {product.discount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            {product.discount}% OFF
                        </span>
                    )}
                    {product.featured && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Featured
                        </span>
                    )}
                    {!product.inStock && (
                        <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded">
                            Out of Stock
                        </span>
                    )}
                </div>

                {/* Quick Action Buttons */}
                <div
                    className={`absolute right-2 top-2 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <button
                        onClick={addToWishlist}
                        className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                        aria-label="Add to wishlist"
                    >
                        <FiHeart className="text-gray-700" />
                    </button>
                    <Link
                        href={`/product/${product._id}`}
                        className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                        aria-label="View product"
                    >
                        <FiEye className="text-gray-700" />
                    </Link>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
                <Link href={`/product/${product._id}`}>
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors mb-1 truncate">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center mb-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={`w-4 h-4 ${i < Math.round(product.averageRating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                            ({product.ratings ? product.ratings.length : 0})
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                        {discountedPrice ? (
                            <>
                                <span className="text-lg font-bold text-gray-900">
                                    ${discountedPrice.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 line-through ml-2">
                                    ${product.price.toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-gray-900">
                                ${product.price.toFixed(2)}
                            </span>
                        )}
                    </div>
                    <span className="text-sm text-gray-500">
                        {product.category}
                    </span>
                </div>

                {/* Size and Color Selection */}
                {isHovered && (
                    <div className="mb-3 space-y-2">
                        {product.sizes && product.sizes.length > 0 && (
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Size:</label>
                                <div className="flex flex-wrap gap-1">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-2 py-1 text-xs border rounded ${selectedSize === size
                                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                    : 'border-gray-300 text-gray-700'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.colors && product.colors.length > 0 && (
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Color:</label>
                                <div className="flex flex-wrap gap-1">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            className={`w-6 h-6 rounded-full border-2 ${selectedColor === color.name
                                                    ? 'border-blue-500'
                                                    : 'border-transparent'
                                                }`}
                                            style={{ backgroundColor: color.code }}
                                            title={color.name}
                                        ></button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Add to Cart Button */}
                <button
                    onClick={handleQuickAddToCart}
                    disabled={!product.inStock || product.stockQuantity === 0}
                    className={`w-full py-2 rounded-lg flex items-center justify-center transition-colors ${!product.inStock || product.stockQuantity === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    <FiShoppingCart className="mr-2" />
                    {!product.inStock || product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard; 