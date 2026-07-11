'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { API_URL } from '@/utils/config';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { RiArrowLeftLine, RiImageAddLine, RiCloseCircleLine, RiDeleteBin6Line, RiAddLine, RiEdit2Line } from 'react-icons/ri';
import Link from 'next/link';
import { SketchPicker } from 'react-color';

export default function EditProduct({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState(null);
  const [tempColorName, setTempColorName] = useState('');
  const [tempColorCode, setTempColorCode] = useState('#FF0000');
  const [uploading, setUploading] = useState(false);
  const [uploadingColorIndex, setUploadingColorIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    sizes: [],
    colors: [],
    discount: '0',
    featured: false,
    popular: false,
    trending: false,
    isFreeShipping: false
  });

  // Fetch product and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        const token = localStorage.getItem('token');

        const config = token ? {
          headers: {
            Authorization: `Bearer ${token}`
          }
        } : {};

        // Fetch product data
        const productRes = await axios.get(`${API_URL}/api/products/${params.id}`, config);
        const product = productRes.data;

        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          category: product.category._id || product.category || '',
          stock: product.stock || '',
          sizes: product.sizes || [],
          colors: product.colors || [],
          discount: product.discount || '0',
          featured: product.featured || false,
          popular: product.popular || false,
          trending: product.trending || false,
          isFreeShipping: product.isFreeShipping || false
        });

        // Fetch categories
        const categoriesRes = await axios.get(`${API_URL}/api/categories`, config);
        setCategories(categoriesRes.data.categories);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load product or categories');
        router.push('/admin/products');
      } finally {
        setInitialLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [params.id, user, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'sizes') {
        const selectedSizes = [...formData.sizes];
        if (checked) {
          selectedSizes.push(value);
        } else {
          const index = selectedSizes.indexOf(value);
          if (index > -1) {
            selectedSizes.splice(index, 1);
          }
        }
        setFormData({ ...formData, sizes: selectedSizes });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Start creating new color variant
  const startNewColor = () => {
    setEditingColorIndex(-1);
    setTempColorName('');
    setTempColorCode('#FF0000');
    setShowColorPicker(false);
  };

  // Start editing existing color variant
  const startEditColor = (index) => {
    setEditingColorIndex(index);
    setTempColorName(formData.colors[index].name);
    setTempColorCode(formData.colors[index].code);
    setShowColorPicker(false);
  };

  // Save color variant (new or edited)
  const saveColorVariant = () => {
    if (!tempColorName.trim()) {
      toast.error('Please enter a color name');
      return;
    }

    const colorExists = formData.colors.some(
      (color, index) =>
        color.name.toLowerCase() === tempColorName.toLowerCase() &&
        index !== editingColorIndex
    );

    if (colorExists) {
      toast.error('Color variant already exists');
      return;
    }

    const updatedColors = [...formData.colors];

    if (editingColorIndex === -1) {
      const newColor = {
        name: tempColorName.trim(),
        code: tempColorCode,
        images: []
      };
      updatedColors.push(newColor);
    } else {
      updatedColors[editingColorIndex] = {
        ...updatedColors[editingColorIndex],
        name: tempColorName.trim(),
        code: tempColorCode
      };
    }

    setFormData({ ...formData, colors: updatedColors });
    setEditingColorIndex(null);
    setTempColorName('');
    setTempColorCode('#FF0000');
    setShowColorPicker(false);
  };

  // Cancel color editing
  const cancelColorEdit = () => {
    setEditingColorIndex(null);
    setTempColorName('');
    setTempColorCode('#FF0000');
    setShowColorPicker(false);
  };

  // Remove color variant
  const removeColorVariant = (index) => {
    const updatedColors = formData.colors.filter((_, i) => i !== index);
    setFormData({ ...formData, colors: updatedColors });
    if (editingColorIndex === index) {
      setEditingColorIndex(null);
    }
  };

  // Handle image upload for specific color
  const handleColorImageUpload = async (colorIndex, files) => {
    if (!files || files.length === 0) return;

    setUploadingColorIndex(colorIndex);
    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        };

        const { data } = await axios.post(`${API_URL}/api/upload`, formDataUpload, config);
        return { url: data.url, public_id: `temp_${Date.now()}_${Math.random()}` };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      const updatedColors = [...formData.colors];
      updatedColors[colorIndex].images = [
        ...updatedColors[colorIndex].images,
        ...uploadedImages
      ];
      setFormData({ ...formData, colors: updatedColors });
      toast.success(`${uploadedImages.length} image(s) added to ${updatedColors[colorIndex].name} variant`);
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setUploadingColorIndex(null);
    }
  };

  // Remove image from color variant
  const removeColorImage = (colorIndex, imageIndex) => {
    const updatedColors = [...formData.colors];
    updatedColors[colorIndex].images.splice(imageIndex, 1);
    setFormData({ ...formData, colors: updatedColors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validate form data
      if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.stock === '') {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Check if at least one color variant has images
      if (formData.colors.length > 0) {
        const colorsWithoutImages = formData.colors.filter(color => color.images.length === 0);
        if (colorsWithoutImages.length > 0) {
          toast.error(`Please add at least one image to: ${colorsWithoutImages.map(c => c.name).join(', ')}`);
          setLoading(false);
          return;
        }
      }

      // Prepare data for submission
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        sizes: formData.sizes,
        colors: formData.colors,
        discount: parseInt(formData.discount) || 0,
        featured: formData.featured,
        popular: formData.popular,
        trending: formData.trending,
        isFreeShipping: formData.isFreeShipping
      };

      const token = localStorage.getItem('token');
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : {};

      await axios.put(`${API_URL}/api/products/${params.id}`, productData, config);

      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
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
          <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
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
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
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

          {/* Color Variants Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-800">Color Variants</h2>
              <button
                type="button"
                onClick={startNewColor}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={editingColorIndex !== null || uploading}
              >
                <RiAddLine className="mr-1" />
                Add Color Variant
              </button>
            </div>

            {/* Color Creation/Edit Form */}
            {editingColorIndex !== null && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-blue-800 mb-3">
                  {editingColorIndex === -1 ? 'Add New Color Variant' : `Edit ${formData.colors[editingColorIndex]?.name} Variant`}
                </h3>
                <div className="flex items-end gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs text-blue-700 mb-1">Color Name</label>
                    <input
                      type="text"
                      value={tempColorName}
                      onChange={(e) => setTempColorName(e.target.value)}
                      placeholder="e.g., Red, Blue, Green"
                      className="w-full border border-blue-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-blue-700 mb-1">Color</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-md cursor-pointer border-2 border-blue-300"
                        style={{ backgroundColor: tempColorCode }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                      />
                      <span className="text-sm text-blue-700">{tempColorCode}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveColorVariant}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelColorEdit}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {showColorPicker && (
                  <div className="relative z-10 mb-4">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowColorPicker(false)}
                    />
                    <div className="absolute z-20 top-0 left-0">
                      <SketchPicker
                        color={tempColorCode}
                        onChange={(color) => setTempColorCode(color.hex)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Existing Color Variants */}
            {formData.colors.length > 0 && (
              <div className="space-y-4">
                {formData.colors.map((color, colorIndex) => (
                  <div key={colorIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {/* Color Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: color.code }}
                        />
                        <div>
                          <span className="font-medium text-gray-800 text-lg">{color.name}</span>
                          <p className="text-sm text-gray-500">
                            {color.images.length} image{color.images.length !== 1 ? 's' : ''} uploaded
                            {color.images.length === 0 && <span className="text-red-500 ml-1">(Please add images)</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditColor(colorIndex)}
                          className="text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={editingColorIndex !== null || uploading}
                        >
                          <RiEdit2Line />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeColorVariant(colorIndex)}
                          className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={editingColorIndex !== null || uploading}
                        >
                          <RiDeleteBin6Line />
                        </button>
                      </div>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                      {/* Upload Area */}
                      <div
                        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors mb-4 ${
                          uploadingColorIndex === colorIndex ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => {
                          if (!uploading) {
                            document.getElementById(`colorImages_${colorIndex}`).click();
                          }
                        }}
                      >
                        <RiImageAddLine className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                          Click to upload images for <strong>{color.name}</strong>
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, GIF up to 5MB each • 4-5 images recommended
                        </p>
                        {uploadingColorIndex === colorIndex && (
                          <p className="text-sm text-blue-600 mt-2">
                            Uploading images...
                          </p>
                        )}
                        <input
                          id={`colorImages_${colorIndex}`}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleColorImageUpload(colorIndex, e.target.files)}
                          disabled={uploading}
                        />
                      </div>

                      {/* Image Preview Grid */}
                      {color.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {color.images.map((image, imageIndex) => (
                            <div key={imageIndex} className="relative group">
                              <img
                                src={image.url}
                                alt={`${color.name} variant ${imageIndex + 1}`}
                                className="w-full h-24 object-cover rounded-md border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeColorImage(colorIndex, imageIndex)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                title="Remove image"
                                disabled={uploading}
                              >
                                <RiCloseCircleLine />
                              </button>
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                {imageIndex + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {formData.colors.length === 0 && editingColorIndex === null && (
              <div className="text-center py-8 text-gray-500">
                <RiImageAddLine className="mx-auto h-12 w-12 mb-2" />
                <p>No color variants added yet</p>
                <p className="text-sm">Add color variants to create image galleries for each color</p>
              </div>
            )}
          </div>

          {/* Product Status */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">Product Status</h2>
            <div className="flex flex-wrap gap-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Featured</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="popular"
                  checked={formData.popular}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Popular</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="trending"
                  checked={formData.trending}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Trending</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isFreeShipping"
                  checked={formData.isFreeShipping}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Free Shipping</span>
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={loading || uploading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              'Update Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}