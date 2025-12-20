'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { API_URL } from '@/utils/config';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { RiArrowLeftLine, RiImageAddLine, RiCloseCircleLine } from 'react-icons/ri';
import Link from 'next/link';
import { SketchPicker } from 'react-color';

export default function NewProduct() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState(['S', 'M', 'L', 'XL', 'XXL']);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stockQuantity: '',
        sizes: [],
        color: '#000000',
        discountPercentage: '0',
        isFeatured: false,
        isPopular: false,
        isTrending: false,
        imageUrl: ''
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setInitialLoading(true);
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('No authentication token found');
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                const { data } = await axios.get(`${API_URL}/api/categories`, config);
                setCategories(data.categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to load categories. Please refresh the page.');
            } finally {
                setInitialLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchCategories();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else if (name === 'sizes') {
            const selectedSizes = [...formData.sizes];
            if (e.target.checked) {
                selectedSizes.push(value);
            } else {
                const index = selectedSizes.indexOf(value);
                if (index > -1) {
                    selectedSizes.splice(index, 1);
                }
            }
            setFormData({ ...formData, sizes: selectedSizes });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleColorChange = (color) => {
        setFormData({ ...formData, color: color.hex });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return '';

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await axios.post(`${API_URL}/api/upload`, formData, config);
            return data.imageUrl;
        } catch (error) {
            console.error('Image upload error:', error);
            throw new Error('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Validate form data
            if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.stockQuantity) {
                toast.error('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // Check if image is selected
            if (!imageFile && !formData.imageUrl) {
                toast.error('Please select a product image');
                setLoading(false);
                return;
            }

            // Upload image if selected
            let imageUrl = formData.imageUrl;
            if (imageFile) {
                imageUrl = await uploadImage();
            }

    

            // Prepare data for submission
            const productData = {
                ...formData,
                imageUrl,
                price: parseFloat(formData.price),
                stockQuantity: parseInt(formData.stockQuantity),
                discountPercentage: parseInt(formData.discountPercentage) || 0
            };

            const { data } = await axios.post(`${API_URL}/api/products`, productData);

            toast.success('Product created successfully');
            router.push('/admin/products');
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error(error.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Link href="/admin/products" className="mr-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100">
                        <RiArrowLeftLine className="text-gray-500" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 space-y-6">
                    {/* Product Image */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Image
                            </label>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                                onClick={() => document.getElementById('productImage').click()}
                            >
                                {previewImage ? (
                                    <div className="relative">
                                        <img
                                            src={previewImage}
                                            alt="Product preview"
                                            className="mx-auto h-48 object-contain rounded-md"
                                        />
                                        <button
                                            type="button"
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewImage('');
                                                setImageFile(null);
                                            }}
                                        >
                                            <RiCloseCircleLine />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <RiImageAddLine className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </div>
                                )}
                                <input
                                    id="productImage"
                                    name="productImage"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-2/3 space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h2 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                            Category *
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((category) => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                            Price ($) *
                                        </label>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                                            Stock Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            id="stockQuantity"
                                            name="stockQuantity"
                                            min="0"
                                            value={formData.stockQuantity}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                                            Discount (%)
                                        </label>
                                        <input
                                            type="number"
                                            id="discountPercentage"
                                            name="discountPercentage"
                                            min="0"
                                            max="100"
                                            value={formData.discountPercentage}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Color
                                        </label>
                                        <div className="flex items-center">
                                            <div
                                                className="w-10 h-10 rounded-md cursor-pointer border border-gray-300"
                                                style={{ backgroundColor: formData.color }}
                                                onClick={() => setShowColorPicker(!showColorPicker)}
                                            />
                                            <span className="ml-2 text-sm text-gray-600">{formData.color}</span>
                                        </div>
                                        {showColorPicker && (
                                            <div className="absolute z-10 mt-2">
                                                <div
                                                    className="fixed inset-0"
                                                    onClick={() => setShowColorPicker(false)}
                                                />
                                                <div className="relative z-20">
                                                    <SketchPicker
                                                        color={formData.color}
                                                        onChange={handleColorChange}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                            </div>

                            {/* Sizes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Sizes
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    {sizes.map((size) => (
                                        <label key={size} className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                name="sizes"
                                                value={size}
                                                checked={formData.sizes.includes(size)}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{size}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Flags */}
                            <div>
                                <h2 className="text-lg font-medium text-gray-800 mb-4">Product Status</h2>
                                <div className="flex flex-wrap gap-6">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isFeatured"
                                            checked={formData.isFeatured}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Featured</span>
                                    </label>

                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isPopular"
                                            checked={formData.isPopular}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Popular</span>
                                    </label>

                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isTrending"
                                            checked={formData.isTrending}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Trending</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <Link
                        href="/admin/products"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={loading || uploading}
                    >
                        {loading || uploading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
} 