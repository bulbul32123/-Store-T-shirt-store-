'use client';

import { useState, useEffect, useRef } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

export default function CategoryForm({ category, categories, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        featured: false,
        parent: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState('');
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                description: category.description || '',
                featured: category.featured || false,
                parent: category.parent?._id || '',
            });

            if (category.image?.url) {
                setImagePreview(category.image.url);
            }
        }
    }, [category]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            setErrors({ ...errors, image: 'Please select an image file' });
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB
            setErrors({ ...errors, image: 'Image size should be less than 2MB' });
            return;
        }

        setFormData({ ...formData, image: file });
        setImagePreview(URL.createObjectURL(file));
        setErrors({ ...errors, image: null });
    };

    const handleRemoveImage = () => {
        setFormData({ ...formData, image: null });
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        }

        // Check if parent category is the same as the current category
        if (category && formData.parent === category._id) {
            newErrors.parent = 'A category cannot be its own parent';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onSave(formData);
    };

    // Filter out current category from parent options to prevent self-referencing
    const parentOptions = categories.filter(cat => !category || cat._id !== category._id);

    return (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {category ? 'Edit Category' : 'Add New Category'}
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 mb-6">
                    {/* Name field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Description field */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                    </div>

                    {/* Parent category field */}
                    <div>
                        <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-1">
                            Parent Category (optional)
                        </label>
                        <select
                            id="parent"
                            name="parent"
                            value={formData.parent}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.parent ? 'border-red-300' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        >
                            <option value="">None (Top Level)</option>
                            {parentOptions.map(cat => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.parent && (
                            <p className="mt-1 text-sm text-red-600">{errors.parent}</p>
                        )}
                    </div>

                    {/* Featured checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="featured"
                            name="featured"
                            checked={formData.featured}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                            Featured Category (will be highlighted on homepage)
                        </label>
                    </div>

                    {/* Image upload field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category Image (optional)
                        </label>

                        <div className="mt-1 flex items-center">
                            {imagePreview ? (
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        alt="Category preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        onClick={handleRemoveImage}
                                    >
                                        <FiX className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400"
                                >
                                    <div className="text-center">
                                        <FiUpload className="mx-auto h-6 w-6 text-gray-400" />
                                        <span className="mt-2 block text-xs text-gray-500">Upload Image</span>
                                    </div>
                                </div>
                            )}

                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                            />
                        </div>

                        {errors.image && (
                            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Recommended size: 300x300px. Max file size: 2MB.
                        </p>
                    </div>
                </div>

                {/* Form actions */}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {category ? 'Update Category' : 'Create Category'}
                    </button>
                </div>
            </form>
        </div>
    );
} 