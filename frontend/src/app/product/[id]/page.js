'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { FiShoppingCart, FiHeart, FiShare2, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ProductReviews from '@/components/products/ProductReviews';
import RelatedProducts from '@/components/products/RelatedProducts';
import toast from 'react-hot-toast';

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

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
                setProduct(data);
                console.log(data);


                // Set default selections
                if (data.sizes && data.sizes.length > 0) {
                    setSelectedSize(data.sizes[0]);
                }

                if (data.colors && data.colors.length > 0) {
                    setSelectedColor(data.colors[0].name);
                }
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

    // Handle quantity change
    const handleQuantityChange = (value) => {
        const newQuantity = quantity + value;
        if (newQuantity > 0 && newQuantity <= product.stock) {
            setQuantity(newQuantity);
        }
    };

    const handleOrderPlace = () => {

    }
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

    // Navigate through product images
    const nextImage = () => {
        if (product?.images?.length > 1) {
            setActiveImage((prev) => (prev === product?.images.length - 1 ? 0 : prev + 1));
        }
    };

    const prevImage = () => {
        if (product?.images?.length > 1) {
            setActiveImage((prev) => (prev === 0 ? product?.images?.length - 1 : prev - 1));
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
                            src={product?.images && product?.images.length > 0
                                ? product?.images[activeImage]?.url
                                : '/images/placeholder.jpg'}
                            alt={product?.name}
                            className="w-full h-full object-contain"
                        />

                        {/* Image Navigation Arrows */}
                        {product?.images && product?.images?.length > 1 && (
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
                    </div>

                    {/* Thumbnail Images */}
                    {product?.images && product?.images?.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                            {product?.images?.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`w-20 h-20 rounded-md overflow-hidden border-2 ${activeImage === index ? 'border-blue-500' : 'border-transparent'
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

                        <div className="flex items-center mb-6">
                            {discountedPrice ? (
                                <>
                                    <span className="text-3xl font-bold text-gray-900">
                                        ${discountedPrice?.toFixed(2)}
                                    </span>
                                    <span className="text-xl text-gray-500 line-through ml-3">
                                        ${product.price?.toFixed(2)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-3xl font-bold text-gray-900">
                                    ${product.price?.toFixed(2)}
                                </span>
                            )}
                        </div>

                        <p className="text-gray-700 mb-6">{product.description}</p>

                        <div className="space-y-6">
                            {/* Size Selection */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-4 py-2 border rounded-md ${selectedSize === size
                                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Color Selection */}
                            {product?.colors?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Color</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {product?.colors?.map((color) => (
                                            <button
                                                key={color?.name}
                                                onClick={() => setSelectedColor(color?.name)}
                                                className={`w-10 h-10 rounded-full border-2 ${selectedColor === color?.name
                                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                                    : 'border-gray-300'
                                                    }`}
                                                style={{ backgroundColor: color?.code }}
                                                title={color?.name}
                                            ></button>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Selected: {selectedColor}
                                    </p>
                                </div>
                            )}

                            {/* Quantity */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
                                <div className="flex items-center">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                        className={`w-10 h-10 rounded-l-md border border-gray-300 flex items-center justify-center ${quantity <= 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (val > 0 && val <= product?.stock) {
                                                setQuantity(val);
                                            }
                                        }}
                                        min="1"
                                        max={product?.stock}
                                        className="w-16 h-10 border-t text-black border-b border-gray-300 text-center"
                                    />
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= product?.stock}
                                        className={`w-10 h-10 rounded-r-md border border-gray-300 flex items-center justify-center ${quantity >= product?.stock ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        +
                                    </button>
                                    <span className="text-sm text-gray-500 ml-4">
                                        {product?.stock} available
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleOrderPlace}
                                    className="flex-1 py-3 px-6  rounded-lg border border-gray-300 flex items-center justify-center bg-blue-600 text-white hover:text-black cursor-pointer font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Order Now
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product?.stock === 0}
                                    className={`flex-1 py-3 px-6 rounded-lg flex items-center justify-center font-medium ${product?.stock === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'hover:bg-blue-600 hover:text-white text-black border border-gray-300 cursor-pointer hover:bg-blue-700'
                                        }`}
                                >
                                    <FiShoppingCart className="mr-2" />
                                    {product?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>

                                <button
                                    onClick={handleAddToWishlist}
                                    className="py-3 px-4  rounded-lg border border-gray-300 flex items-center justify-center cursor-pointer font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <FiHeart className="" />
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
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Reviews */}
            <div className="mt-16">
                <ProductReviews productId={id} reviews={product.ratings || []} />
            </div>

            {/* Related Products */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
                {/* <RelatedProducts category={product.category} currentProductId={id} /> */}
            </div>
        </div>
    );
} 