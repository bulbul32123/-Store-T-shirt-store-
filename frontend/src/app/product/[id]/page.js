'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { FiShoppingCart, FiHeart, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import SizeSelection from '@/components/products/SizeSelection';
import DiscountedPrice from '@/components/products/DiscountedPrice';
import Quantity from '@/components/products/Quantity';

export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [activeImage, setActiveImage] = useState(0);
    const [currentImages, setCurrentImages] = useState([]); // Current image set based on selected color

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
                setProduct(data);

                // Set default size
                if (data.sizes && data.sizes.length > 0) {
                    setSelectedSize(data.sizes[0]);
                }

                // Set default color and initialize images
                if (data.colors && data.colors.length > 0) {
                    setSelectedColor(data.colors[0].name);
                    setCurrentImages(data.colors[0].images || []);
                } else if (data.images && data.images.length > 0) {
                    // Fallback to legacy images if no color variants
                    setCurrentImages(data.images);
                }

                // Reset active image when product changes
                setActiveImage(0);
            } catch (error) {
                console.error('Error fetching product:', error);
                setError('Failed to load product. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    // Handle color change - switch image gallery
    const handleColorChange = (colorName) => {
        setSelectedColor(colorName);

        // Find the selected color variant
        const selectedColorVariant = product.colors.find(color => color.name === colorName);

        if (selectedColorVariant && selectedColorVariant.images.length > 0) {
            // Switch to the selected color's image gallery
            setCurrentImages(selectedColorVariant.images);
            setActiveImage(0); // Reset to first image of the new color
        } else {
            // Fallback to legacy images if color variant has no images
            setCurrentImages(product.images || []);
            setActiveImage(0);
        }
    };

    // Handle quantity change
    const handleQuantityChange = (value) => {
        const newQuantity = quantity + value;
        if (newQuantity > 0 && newQuantity <= product.stock) {
            setQuantity(newQuantity);
        }
    };

    const handleOrderPlace = () => {
        // Order placement logic
    };

    // Handle add to cart
    const handleAddToCart = () => {
        if (product.stock === 0) {
            toast.error('This product is out of stock');
            return;
        }

        if (product.sizes.length > 0 && !selectedSize) {
            toast.error('Please select a size');
            return;
        }

        if (product.colors.length > 0 && !selectedColor) {
            toast.error('Please select a color');
            return;
        }

        addToCart(product, quantity, selectedSize, selectedColor);
    };

    // Handle add to wishlist
    const handleAddToWishlist = async () => {
        try {
            if (!user) {
                toast.error('Please login to add items to your wishlist');
                return;
            }
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/wishlist`,
                { productId: product._id },
            );

            toast.success('Added to wishlist!');
        } catch (error) {
            console.error('Add to wishlist error:', error);
            toast.error(error.response?.data?.message || 'Failed to add to wishlist');
        }
    };

    // Navigate through current image set
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                <p className="text-gray-700 mb-6">{error || 'Product not found'}</p>
                <button
                    onClick={() => window.history.back()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Calculate discount price if applicable
    const discountedPrice = product?.discount
        ? product?.price - (product?.price * product?.discount) / 100
        : null;

    return (
        <div className="container mx-auto px-4 py-16 mt-16 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Product Images */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                            src={currentImages.length > 0
                                ? currentImages[activeImage]?.url
                                : '/images/placeholder.jpg'}
                            alt={`${product?.name} - ${selectedColor}`}
                            className="w-full h-full object-contain"
                        />

                        {/* Image Navigation Arrows */}
                        {currentImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 text-gray-800 transition-colors"
                                    aria-label="Previous image"
                                >
                                    <FiChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 text-gray-800 transition-colors"
                                    aria-label="Next image"
                                >
                                    <FiChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        {/* Discount Badge */}
                        {product?.discount > 0 && (
                            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                                {product?.discount}% OFF
                            </span>
                        )}

                        {/* Image Counter */}
                        {currentImages.length > 1 && (
                            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                {activeImage + 1} / {currentImages.length}
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Images */}
                    {currentImages.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                            {currentImages.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 ${activeImage === index ? 'border-blue-500' : 'border-transparent'
                                        }`}
                                >
                                    <img
                                        src={image?.url}
                                        alt={`${product?.name} - view ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                        <div className="flex items-center mb-4">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.round(product.averageRating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                                <span className="text-sm text-gray-500 ml-2">
                                    {product.averageRating?.toFixed(1)} ({product.ratings ? product.ratings.length : 0} reviews)
                                </span>
                            </div>
                        </div>

                        <DiscountedPrice discountedPrice={discountedPrice} product={product} />

                        <p className="text-gray-700 mb-6">{product.description}</p>

                        <div className="space-y-6">
                            {product.sizes && product.sizes.length > 0 && (
                                <SizeSelection
                                    product={product}
                                    setSelectedSize={setSelectedSize}
                                    selectedSize={selectedSize}
                                />
                            )}

                            {/* Color Selection with Amazon-style behavior */}
                            {product?.colors?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Color</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {product?.colors?.map((color) => (
                                            <button
                                                key={color?.name}
                                                onClick={() => handleColorChange(color?.name)}
                                                className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 ${selectedColor === color?.name
                                                        ? 'border-blue-500 ring-2 ring-blue-200 scale-105'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                                style={{ backgroundColor: color?.code }}
                                                title={color?.name}
                                            >
                                                {selectedColor === color?.name && (
                                                    <div className="w-full h-full rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        <span className="font-medium">Selected:</span> {selectedColor}
                                        {product.colors.find(c => c.name === selectedColor)?.images.length > 0 && (
                                            <span className="ml-2">
                                                ({product.colors.find(c => c.name === selectedColor)?.images.length} images)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}

                            <Quantity
                                handleQuantityChange={handleQuantityChange}
                                quantity={quantity}
                                setQuantity={setQuantity}
                                product={product}
                            />

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleOrderPlace}
                                    className="flex-1 py-3 px-6 rounded-lg border border-gray-300 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                                >
                                    Order Now
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product?.stock === 0}
                                    className={`flex-1 py-3 px-6 rounded-lg flex items-center justify-center font-medium transition-colors ${product?.stock === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'hover:bg-blue-700 hover:text-white text-black border border-gray-300'
                                        }`}
                                >
                                    <FiShoppingCart className="mr-2" />
                                    {product?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>

                                <button
                                    onClick={handleAddToWishlist}
                                    className="py-3 px-4 rounded-lg border border-gray-300 flex items-center justify-center font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <FiHeart />
                                </button>
                            </div>

                            {/* Product Details */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li><span className="font-medium">Category:</span> {product?.category}</li>
                                    {product?.tags && product?.tags?.length > 0 && (
                                        <li>
                                            <span className="font-medium">Tags:</span>{' '}
                                            {product?.tags.join(', ')}
                                        </li>
                                    )}
                                    <li><span className="font-medium">In Stock:</span> {product?.stock ? 'Yes' : 'No'}</li>
                                    {product?.colors?.length > 0 && (
                                        <li>
                                            <span className="font-medium">Available Colors:</span>{' '}
                                            {product.colors.map(color => color.name).join(', ')}
                                        </li>
                                    )}
                                    {product?.sizes?.length > 0 && (
                                        <li>
                                            <span className="font-medium">Available Sizes:</span>{' '}
                                            {product.sizes.join(', ')}
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {/* Color Variant Info */}
                            {product?.colors?.length > 0 && selectedColor && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">About {selectedColor} Variant</h4>
                                    <p className="text-sm text-blue-800">
                                        You're viewing the {selectedColor.toLowerCase()} variant of this product.
                                        {currentImages.length > 1 && (
                                            ` This variant has ${currentImages.length} high-quality images showing different angles and details.`
                                        )}
                                        {product.colors.length > 1 && (
                                            ` Choose from ${product.colors.length} different color options above to see their respective image galleries.`
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}