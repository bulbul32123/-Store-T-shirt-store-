'use client';
import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiUpload } from 'react-icons/fi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import React from 'react';
import { toast } from 'react-hot-toast';

// Add CSS for animation
const fadeIn = {
    animation: 'fadeIn 0.3s ease-in-out',
};

const ProductForm = ({
    // State props
    formData,
    images,
    errors,
    loading,
    uploadingImage,
    fileInputRef,
    categories,
    isEdit,

    // Handler props
    handleChange,
    handleSubmit,
    handleImageUpload,
    handleRemoveImage,
    handleSizeChange,
    onCancel,
}) => {
    // Define the available sizes
    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    const [showDiscount, setShowDiscount] = useState(false);
    // State for new color
    const [newColor, setNewColor] = useState({ name: '', code: '#000000' });

    // Add debugging for color data
    useEffect(() => {
        if (isEdit && formData.colors && formData.colors.length > 0) {
            console.log('Color data for editing:', formData.colors);
        }
    }, [isEdit, formData.colors]);

    // Add this useEffect to normalize color data on edit
    useEffect(() => {
        if (isEdit && formData.colors && formData.colors.length > 0) {
            console.log('Normalizing color data for edit mode...');

            // Check if any colors need to be formatted
            const needsFormatting = formData.colors.some(color =>
                typeof color === 'string' ||
                (typeof color === 'object' && (!color.code || !color.name))
            );

            if (needsFormatting) {
                console.log('Color data needs formatting, converting...');

                // Create properly formatted color objects
                const formattedColors = formData.colors.map((color, index) => {
                    // If already an object with name and code, keep as is
                    if (typeof color === 'object' && color.name && color.code) {
                        return color;
                    }

                    // If string, create object with name and default code
                    if (typeof color === 'string') {
                        return { name: color, code: '#000000' };
                    }

                    // If object but missing properties
                    return {
                        name: color.name || `Color ${index + 1}`,
                        code: color.code || '#000000'
                    };
                });

                // Update the form data
                handleChange({
                    target: {
                        name: 'colors',
                        value: formattedColors
                    }
                });

                console.log('Formatted colors:', formattedColors);
            }
        }
    }, [isEdit, formData.colors, handleChange]);

    // Enhanced color handling
    const handleAddNewColor = () => {
        if (!newColor.name.trim()) return;

        // Check if we've reached the maximum number of colors
        if (formData.colors.length >= 5) {
            toast.error('Maximum of 5 colors reached.');
            return;
        }

        // Create a properly formatted color object
        const colorObject = {
            name: newColor.name.trim(),
            code: newColor.code || '#000000'
        };

        // Add to colors array
        const updatedColors = [...formData.colors, colorObject];

        handleChange({
            target: {
                name: 'colors',
                value: updatedColors
            }
        });

        // Reset inputs
        setNewColor({ name: '', code: newColor.code });
    };

    // Updated color removal
    const handleRemoveColorByName = (name) => {
        const updatedColors = formData.colors.filter(color =>
            typeof color === 'object' ? color.name !== name : color !== name
        );

        handleChange({
            target: {
                name: 'colors',
                value: updatedColors
            }
        });
    };

    // Improved color normalization with better debugging
    const normalizedColors = React.useMemo(() => {
        if (!Array.isArray(formData.colors)) return [];

        console.log('Raw formData.colors:', JSON.stringify(formData.colors));

        return formData.colors.map((color, index) => {
            console.log(`Processing color ${index}:`, color);

            // Handle string colors
            if (typeof color === 'string') {
                return {
                    id: `color-string-${index}`,
                    name: color,
                    code: '#000000'
                };
            }

            // Get the color name
            const colorName = color.name || 'Unnamed';

            // Extract color code with detailed logging
            let colorCode = null;
            if (color.code) {
                console.log(`Found code property: ${color.code}`);
                colorCode = color.code;
            } else if (color.hex) {
                console.log(`Found hex property: ${color.hex}`);
                colorCode = color.hex;
            } else if (color.color) {
                console.log(`Found color property: ${color.color}`);
                colorCode = color.color;
            } else {
                console.log(`No color code found, using default`);
                colorCode = '#000000';
            }

            // Ensure hex format
            if (colorCode && !colorCode.startsWith('#')) {
                colorCode = '#' + colorCode;
            }

            const normalizedColor = {
                id: `color-${index}`, // Removed Date.now() to prevent re-renders
                name: colorName,
                code: colorCode
            };

            console.log(`Normalized color ${index}:`, normalizedColor);
            return normalizedColor;
        });
    }, [formData.colors]);

    // Add this function near the top of your component
    const getContrastColor = (hexColor) => {
        // Default to black if color format is invalid
        if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
            return '#000000';
        }

        // Convert hex to RGB
        let r, g, b;
        if (hexColor.length === 7) {
            r = parseInt(hexColor.substring(1, 3), 16);
            g = parseInt(hexColor.substring(3, 5), 16);
            b = parseInt(hexColor.substring(5, 7), 16);
        } else if (hexColor.length === 4) {
            r = parseInt(hexColor.substring(1, 2), 16) * 17;
            g = parseInt(hexColor.substring(2, 3), 16) * 17;
            b = parseInt(hexColor.substring(3, 4), 16) * 17;
        } else {
            return '#000000';
        }

        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Return white for dark colors, black for light colors
        return luminance > 0.5 ? '#000000' : '#ffffff';
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.category ? 'border-red-300' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price ($) *
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className={`w-full px-3 py-2 border ${errors.price ? 'border-red-300' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.price && (
                            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stock Quantity *
                        </label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            className={`w-full px-3 py-2 border ${errors.stock ? 'border-red-300' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.stock && (
                            <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                </div>

                {/* Sizes - Updated to use selectable buttons */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sizes *
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {availableSizes.map((size) => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => handleSizeChange(size)}
                                className={`px-4 py-2 rounded-md border ${formData.sizes.includes(size)
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    } transition-colors`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                    {errors.sizes && (
                        <p className="mt-1 text-sm text-red-600">{errors.sizes}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        Click to select or deselect sizes
                    </p>
                </div>

                {/* Colors with Simple Color Picker */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Colors * <span className="text-xs text-gray-500 font-normal">(Max 5)</span>
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={newColor.name}
                            onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                            placeholder="Color name (e.g., Red, Blue)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            disabled={normalizedColors.length >= 6}
                        />
                        <input
                            type="color"
                            value={newColor.code}
                            onChange={(e) => setNewColor({ ...newColor, code: e.target.value })}
                            className={`h-10 w-10 border border-gray-300 rounded cursor-pointer ${normalizedColors.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={normalizedColors.length >= 5}
                        />
                        <button
                            type="button"
                            onClick={handleAddNewColor}
                            className={`${normalizedColors.length >= 5 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded`}
                            disabled={normalizedColors.length >= 5}
                        >
                            Add
                        </button>
                    </div>

                    {/* Color counter */}
                    <div className="mt-1 text-xs text-gray-500">
                        {normalizedColors.length} of 5 colors used
                    </div>

                    {/* Color Pills - Updated with background color and adaptive text */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {normalizedColors.map(color => {
                            const textColor = getContrastColor(color.code);
                            return (
                                <div
                                    key={color.id}
                                    className="px-3 py-1 rounded-full flex items-center"
                                    style={{
                                        backgroundColor: color.code,
                                        border: textColor === '#000000' ? '1px solid #e2e8f0' : 'none'
                                    }}
                                >
                                    <span
                                        className="font-medium"
                                        style={{ color: textColor }}
                                    >
                                        {color.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveColorByName(color.name)}
                                        className="ml-2 hover:text-red-500"
                                        style={{ color: textColor }}
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {errors.colors && (
                        <p className="mt-1 text-sm text-red-600">{errors.colors}</p>
                    )}
                </div>

                {/* Images - Grid Layout */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Images * <span className="text-xs text-gray-500 font-normal">(Max 5)</span>
                    </label>

                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {/* Existing Images */}
                        {images.map((image, index) => (
                            <div key={image.public_id || `img-${index}`} className="relative group">
                                <div className="w-full h-32 border rounded-lg overflow-hidden bg-gray-50">
                                    <img
                                        src={image.url}
                                        alt={`Product ${index}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(image.public_id)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        {/* Add Image Button - Only shown if under limit */}
                        {images.length < 5 && (
                            <div
                                onClick={() => !uploadingImage && fileInputRef.current.click()}
                                className={`w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 bg-gray-50 ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploadingImage ? (
                                    <>
                                        <LoadingSpinner size="medium" />
                                        <span className="mt-2 text-sm text-gray-500">Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiPlus className="h-8 w-8 text-gray-400" />
                                        <span className="mt-2 text-sm text-gray-500">Add Image</span>
                                    </>
                                )}
                            </div>
                        )}

                        <input
                            type="file"
                            id="file-upload"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageUpload}
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                            disabled={uploadingImage || images.length >= 5}
                            multiple
                        />
                    </div>

                    {/* Counter and Help Text */}
                    <div className="mt-2 flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                            JPG, JPEG, PNG, WEBP, GIF up to 5MB
                        </p>
                        <p className="text-xs font-medium text-gray-700">
                            {images.length} of 5 images
                        </p>
                    </div>

                    {errors.images && (
                        <p className="mt-1 text-sm text-red-600">{errors.images}</p>
                    )}
                </div>

                {/* Featured, Trending, Popular */}
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="featured"
                            checked={formData.featured}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Featured</span>
                    </label>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="trending"
                            checked={formData.trending}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Trending</span>
                    </label>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="popular"
                            checked={formData.popular}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Popular</span>
                    </label>

                    {/* Discount Toggle Feature - Completed */}
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={() => setShowDiscount(!showDiscount)}
                            className={`px-3 py-1 text-sm border rounded-md flex items-center ${showDiscount
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                }`}
                        >
                            {showDiscount ? 'Hide Discount' : 'Add Discount'}
                            <span className="ml-1">{showDiscount ? '↑' : '↓'}</span>
                        </button>
                    </div>
                </div>

                {/* Discount Input Field - Displayed when toggled */}
                {showDiscount && (
                    <div style={fadeIn}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Discount Percentage (%)
                        </label>
                        <div className="flex items-center">
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter discount percentage"
                            />
                            <span className="ml-2 text-sm text-gray-500">
                                {formData.discount > 0 && `Discounted price: $${(formData.price - (formData.price * formData.discount / 100)).toFixed(2)}`}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Enter a value between 0-100 to apply a percentage discount
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner size="small" />
                                <span className="ml-2">Creating...</span>
                            </>
                        ) : (
                            <span>{isEdit ? 'Update Product' : 'Create Product'}</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;