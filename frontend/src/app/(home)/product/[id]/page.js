'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWatchlist } from '@/context/WatchlistContext';
import axios from 'axios';
import {
    FiHeart, FiStar, FiTruck, FiRefreshCw, FiShield,
    FiMinus, FiPlus, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import ProductReviews from '@/components/review/ProductReviews';

// Product.images is an untyped Array and can hold either raw strings or
// { url, public_id } objects — this resolves either shape defensively.
const getImageUrl = (img) =>
    (typeof img === 'string' ? img : img?.url) || '/images/placeholder.jpg';

export default function ProductDetail() {
    const { id } = useParams();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState('reviews');

    const { addToCart } = useCart();
const { toggleWatchlist, isInWatchlist } = useWatchlist();

    // ── Fetch product ─────────────────────────────────────────────────────
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
                setProduct(data);

                if (data.sizes?.length) setSelectedSize(data.sizes[0]);
                if (data.colors?.length) setSelectedColor(data.colors[0].name);

                setActiveImage(0);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to load product. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    // ── Derived image gallery, based on selected color ───────────────────
    const currentImages = useMemo(() => {
        if (!product) return [];

        if (selectedColor && product.colors?.length) {
            const colorObj = product.colors.find((c) => c.name === selectedColor);
            if (colorObj?.images?.length) {
                return colorObj.images.map((img) => getImageUrl(img));
            }
        }
        // Legacy fallback for products with no color variants
        return (product.images || []).map((img) => getImageUrl(img));
    }, [product, selectedColor]);

    // Reset the active gallery image whenever the color changes
    useEffect(() => {
        setActiveImage(0);
    }, [selectedColor]);

    const inWishlist = useMemo(() => {
        if (!user?.wishlist?.length || !product?._id) return false;
        return user.wishlist.some((w) => (typeof w === 'string' ? w : w?._id) === product._id);
    }, [user, product]);

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleColorChange = (colorName) => setSelectedColor(colorName);

    const handleQuantityChange = (delta) => {
        const next = quantity + delta;
        if (next > 0 && next <= product.stock) setQuantity(next);
    };

    const handleOrderPlace = () => {
        // Order placement logic
    };

    const handleAddToCart = () => {
        if (product.stock === 0) {
            toast.error('This product is out of stock');
            return;
        }
        if (product.sizes?.length > 0 && !selectedSize) {
            toast.error('Please select a size');
            return;
        }
        if (product.colors?.length > 0 && !selectedColor) {
            toast.error('Please select a color');
            return;
        }
        addToCart(product, quantity, selectedSize, selectedColor);
        toast.success('Added to cart!');
    };

    const handleAddToWishlist = async () => {
        try {
            if (!user) {
                toast.error('Please login to add items to your wishlist');
                return;
            }
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/wishlist`,
                { productId: product._id }
            );
            toast.success('Added to wishlist!');
        } catch (err) {
            console.error('Add to wishlist error:', err);
            toast.error(err.response?.data?.message || 'Failed to add to wishlist');
        }
    };

    const nextImage = () => {
        if (currentImages.length > 1) {
            setActiveImage((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1));
        }
    };
    const prevImage = () => {
        if (currentImages.length > 1) {
            setActiveImage((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1));
        }
    };

    // ── Loading / error states ─────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-16 text-center mt-16">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                <p className="text-gray-700 mb-6">{error || 'Product not found'}</p>
                <button
                    onClick={() => window.history.back()}
                    className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // ── Derived pricing ──────────────────────────────────────────────────────
    const discountedPrice = product.discount
        ? product.price - (product.price * product.discount) / 100
        : null;
    const displayPrice  = discountedPrice ?? product.price;
    const reviewCount   = product.numReviews ?? product.ratings?.length ?? 0;
    const categoryName  = product.category?.name || product.category || '—';
 const inWatchlist = isInWatchlist(product?._id);
    return (
        <div className="container mx-auto px-4 lg:px-4 py-8 mt-16 bg-white">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

                {/* ── Image Gallery ──────────────────────────────────────── */}
                <div className="space-y-4">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                            src={currentImages[activeImage] || '/images/placeholder.jpg'}
                            alt={`${product.name}${selectedColor ? ` - ${selectedColor}` : ''}`}
                            className="w-full h-full object-cover"
                        />

                        {currentImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    aria-label="Previous image"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 text-gray-800 transition-colors"
                                >
                                    <FiChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    aria-label="Next image"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 text-gray-800 transition-colors"
                                >
                                    <FiChevronRight className="h-5 w-5" />
                                </button>
                            </>
                        )}

                        {product.discount > 0 && (
                            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                                {product.discount}% OFF
                            </span>
                        )}

                        {currentImages.length > 1 && (
                            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                {activeImage + 1} / {currentImages.length}
                            </div>
                        )}
                    </div>

                    {/* Thumbnails — within the selected color's image set */}
                    {currentImages.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {currentImages.map((src, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                                        activeImage === idx
                                            ? 'border-gray-900'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Product Info ───────────────────────────────────────── */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar
                                        key={i}
                                        className={`h-4 w-4 ${
                                            i < Math.round(product.averageRating || 0)
                                                ? 'fill-current text-gray-900'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                                <span className="text-sm font-medium text-gray-900">
                                    {(product.averageRating || 0).toFixed(1)}
                                </span>
                                <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
                            </div>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-3xl font-bold text-gray-900">${displayPrice.toFixed(2)}</span>
                        {discountedPrice !== null && (
                            <span className="text-lg text-gray-400 line-through">${product.price.toFixed(2)}</span>
                        )}
                        {product.isFreeShipping && (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                Free Shipping
                            </span>
                        )}
                    </div>

                    <p className="text-gray-700 leading-relaxed">{product.description}</p>

                    {/* Color picker — styled as image thumbnails, mirroring the reference design's variant picker */}
                    {product.colors?.length > 0 && (
                        <div className="space-y-3">
                            <span className="text-sm font-medium text-gray-900">Color</span>
                            <div className="flex gap-2 pb-2 flex-wrap">
                                {product.colors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => handleColorChange(color.name)}
                                        title={color.name}
                                        className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                                            selectedColor === color.name
                                                ? 'border-gray-900 scale-105'
                                                : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={getImageUrl(color.images?.[0])}
                                            alt={color.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <span
                                            className="absolute bottom-1 right-1 h-3 w-3 rounded-full border border-white shadow"
                                            style={{ backgroundColor: color.code }}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-700">Selected:</span> {selectedColor}
                            </p>
                        </div>
                    )}

                    {/* Size — global to the product (schema has no per-color/per-size stock) */}
                    {product.sizes?.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">Size</span>
                                <button className="text-sm text-gray-500 underline">Size Guide</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        disabled={product.stock === 0}
                                        className={`h-11 px-4 text-sm font-medium rounded-md border transition-all ${
                                            selectedSize === size
                                                ? 'bg-gray-900 text-white border-gray-900'
                                                : product.stock === 0
                                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                                    : 'border-gray-300 text-gray-900 hover:border-gray-900'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {product.stock > 0 && product.stock < 10 && (
                                <p className="text-xs text-amber-600 font-medium">Only {product.stock} left in stock</p>
                            )}
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="space-y-3">
                        <span className="text-sm font-medium text-gray-900">Quantity</span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                                className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <FiMinus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                            <button
                                onClick={() => handleQuantityChange(1)}
                                disabled={quantity >= product.stock}
                                className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <FiPlus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleOrderPlace}
                            disabled={product.stock === 0}
                            className="flex-1 h-14 rounded-md font-medium bg-gray-900 text-white border border-gray-900 transition-colors hover:bg-white hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Buy Now
                        </button>
                        <button
                            onClick={() => addToCart(product, { size: selectedSize, color: selectedColor, quantity })}
                            disabled={product.stock === 0}
                            className="flex-1 h-14 rounded-md font-medium border border-gray-300 text-gray-900 transition-colors hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button
                            onClick={() => toggleWatchlist(product, { size: selectedSize, color: selectedColor })}
                            className={`h-14 w-14 flex-shrink-0 inline-flex items-center justify-center rounded-md bg-gray-900 text-white transition-colors`}
                        >
                            <FiHeart className={`h-5 w-5 ${inWatchlist ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                            <FiTruck className="h-5 w-5 mx-auto text-gray-500 mb-1" />
                            <span className="text-xs text-gray-500">
                                {product.isFreeShipping ? 'Free Delivery' : 'Standard Delivery 50TK'}
                            </span>
                        </div>
                        <div className="text-center">
                            <FiRefreshCw className="h-5 w-5 mx-auto text-gray-500 mb-1" />
                            <span className="text-xs text-gray-500">7-Day Returns</span>
                        </div>
                        <div className="text-center">
                            <FiShield className="h-5 w-5 mx-auto text-gray-500 mb-1" />
                            <span className="text-xs text-gray-500">Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Description / Reviews — tab switcher ────────────────────────── */}
            <div className="mt-10 border-t-2 border-gray-200">
                {/* Tab bar */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                            activeTab === 'reviews'
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Reviews
                        {product.numReviews > 0 && (
                            <span className="ml-2 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {product.numReviews}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('description')}
                        className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                            activeTab === 'description'
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Description
                    </button>
                </div>

                {/* Reviews tab */}
                {activeTab === 'reviews' && (
                    <div className="py-6">
                        <ProductReviews product={product} />
                    </div>
                )}

                {/* Description tab */}
                {activeTab === 'description' && (
                    <div className="py-6 max-w-3xl">
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                        <ul className="mt-8 space-y-3 text-sm border-t border-gray-100 pt-6">
                            <li className="flex gap-3">
                                <span className="font-semibold text-gray-900 w-36 flex-shrink-0">Category</span>
                                <span className="text-gray-600">{categoryName}</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-semibold text-gray-900 w-36 flex-shrink-0">In Stock</span>
                                <span className={product.stock > 0 ? 'text-emerald-600 font-medium' : 'text-red-500'}>
                                    {product.stock > 0 ? `Yes — ${product.stock} units available` : 'Out of stock'}
                                </span>
                            </li>
                            {product.colors?.length > 0 && (
                                <li className="flex gap-3">
                                    <span className="font-semibold text-gray-900 w-36 flex-shrink-0">Colors</span>
                                    <span className="text-gray-600">{product.colors.map((c) => c.name).join(', ')}</span>
                                </li>
                            )}
                            {product.sizes?.length > 0 && (
                                <li className="flex gap-3">
                                    <span className="font-semibold text-gray-900 w-36 flex-shrink-0">Sizes</span>
                                    <span className="text-gray-600">{product.sizes.join(', ')}</span>
                                </li>
                            )}
                            {product.isFreeShipping && (
                                <li className="flex gap-3">
                                    <span className="font-semibold text-gray-900 w-36 flex-shrink-0">Shipping</span>
                                    <span className="text-emerald-600 font-medium">Free shipping included</span>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}