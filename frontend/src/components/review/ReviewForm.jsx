'use client';
import { useState, useEffect, useRef } from 'react';
import { FiX, FiUpload, FiTrash2, FiLoader } from 'react-icons/fi';
import { useReviews } from '@/context/ReviewContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const FIT_OPTIONS = ['Too Small', 'True to Size', 'Too Large'];

// ── Interactive star picker ───────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
    const [hover, setHover] = useState(0);
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(n => (
                    <button
                        key={n}
                        type="button"
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => onChange(n)}
                        className="p-0.5 transition-transform hover:scale-125 focus:outline-none"
                    >
                        <svg className="w-9 h-9 transition-colors" viewBox="0 0 20 20">
                            <path
                                fill={n <= (hover || value) ? '#f59e0b' : '#e5e7eb'}
                                stroke={n <= (hover || value) ? '#d97706' : '#d1d5db'}
                                strokeWidth="0.5"
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
                        </svg>
                    </button>
                ))}
                {(hover || value) > 0 && (
                    <span className="ml-2 text-sm font-medium text-gray-600">
                        {labels[hover || value]}
                    </span>
                )}
            </div>
        </div>
    );
}

// ── Image upload tile ─────────────────────────────────────────────────────────
function ImageUploadTile({ image, onRemove }) {
    return (
        <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-gray-200 group flex-shrink-0">
            <img src={image.url} alt="" className="h-full w-full object-cover" />
            <button
                type="button"
                onClick={onRemove}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <FiTrash2 size={16} className="text-white" />
            </button>
        </div>
    );
}

export default function ReviewForm() {
    const { showForm, editingReview, closeForm, handleSubmit, handleEdit, product, currentUser } = useReviews();
    const isEdit = Boolean(editingReview);

    const [form, setForm] = useState({
        rating:        0,
        reviewText:    '',
        sizePurchased: '',
        colorPurchased:'',
        fitFeedback:   '',
        isAnonymous:   false,
        videoUrl:      '',
    });
    const [images,       setImages]       = useState([]);  // [{url, public_id}]
    const [uploading,    setUploading]    = useState(false);
    const [submitting,   setSubmitting]   = useState(false);
    const fileRef = useRef(null);

    // Pre-fill on edit
    useEffect(() => {
        if (editingReview) {
            setForm({
                rating:         editingReview.rating        || 0,
                reviewText:     editingReview.reviewText    || '',
                sizePurchased:  editingReview.sizePurchased || '',
                colorPurchased: editingReview.colorPurchased|| '',
                fitFeedback:    editingReview.fitFeedback   || '',
                isAnonymous:    editingReview.isAnonymous   || false,
                videoUrl:       editingReview.video?.url    || '',
            });
            setImages(editingReview.images || []);
        } else {
            setForm({ rating: 0, reviewText: '', sizePurchased: '', colorPurchased: '', fitFeedback: '', isAnonymous: false, videoUrl: '' });
            setImages([]);
        }
    }, [editingReview, showForm]);

    // Close on Escape
    useEffect(() => {
        if (!showForm) return;
        const handler = (e) => { if (e.key === 'Escape') closeForm(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [showForm, closeForm]);

    // ── Image upload ───────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (images.length + files.length > 3) {
        toast.error('Maximum 3 images allowed'); return;
    }
    setUploading(true);
    try {
        const uploaded = await Promise.all(files.map(async (file) => {
            const fd = new FormData();
            
            // 🔴 CHANGE THIS FROM 'file' TO MATCH WHAT YOUR BACKEND EXPECTS (e.g., 'image')
            fd.append('image', file); 
            
            const { data } = await axios.post(`${API}/api/upload`, fd, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            const url        = data.url || data.secure_url || data?.data?.url;
            const public_id  = data.public_id || data?.data?.public_id || '';
            return { url, public_id };
        }));
        setImages(prev => [...prev, ...uploaded]);
    } catch (err) {
        toast.error(err.response?.data?.message || 'Image upload failed');
    } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
    }
};

    // ── Submit ─────────────────────────────────────────────────────────────────
    const onSubmit = async () => {
        if (!currentUser) { toast.error('Please login to submit a review'); return; }
        if (!form.rating) { toast.error('Please select a rating'); return; }
        if (form.reviewText.trim().length < 10) { toast.error('Review must be at least 10 characters'); return; }

        setSubmitting(true);
        try {
            const payload = {
                ...form,
                images,
                video: form.videoUrl ? { url: form.videoUrl, public_id: '' } : undefined,
            };
            if (isEdit) {
                await handleEdit(editingReview._id, payload);
            } else {
                await handleSubmit(payload);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (!showForm) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeForm} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-900">
                        {isEdit ? 'Edit Review' : 'Write a Review'}
                    </h2>
                    <button onClick={closeForm} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                        <FiX size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Star rating */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rating <span className="text-rose-500">*</span>
                        </label>
                        <StarPicker value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} />
                    </div>

                    {/* Review text */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Review <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            value={form.reviewText}
                            onChange={(e) => setForm(f => ({ ...f, reviewText: e.target.value }))}
                            rows={4}
                            maxLength={1000}
                            placeholder="Share your experience with this product..."
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">
                            {form.reviewText.length} / 1000
                        </p>
                    </div>

                    {/* Size + Color */}
                    <div className="grid grid-cols-2 gap-3">
                        {product?.sizes?.length > 0 && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Size Purchased</label>
                                <select
                                    value={form.sizePurchased}
                                    onChange={(e) => setForm(f => ({ ...f, sizePurchased: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-700"
                                >
                                    <option value="">Select size</option>
                                    {product.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                        {product?.colors?.length > 0 && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Color Purchased</label>
                                <select
                                    value={form.colorPurchased}
                                    onChange={(e) => setForm(f => ({ ...f, colorPurchased: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-700"
                                >
                                    <option value="">Select color</option>
                                    {product.colors.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Fit feedback */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">How does it fit?</label>
                        <div className="flex gap-2 flex-wrap">
                            {FIT_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, fitFeedback: f.fitFeedback === opt ? '' : opt }))}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                        form.fitFeedback === opt
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image upload */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                            Photos <span className="text-gray-400 font-normal">(up to 3)</span>
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {images.map((img, i) => (
                                <ImageUploadTile
                                    key={i}
                                    image={img}
                                    onRemove={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                />
                            ))}
                            {images.length < 3 && (
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                    className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 flex-shrink-0"
                                >
                                    {uploading ? <FiLoader size={18} className="animate-spin" /> : <FiUpload size={18} />}
                                    <span className="text-xs">Add photo</span>
                                </button>
                            )}
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </div>

                    {/* Video URL */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Video URL <span className="text-gray-400 font-normal">(optional — YouTube or direct link)</span>
                        </label>
                        <input
                            type="url"
                            value={form.videoUrl}
                            onChange={(e) => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400"
                        />
                    </div>

                    {/* Anonymous toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Post anonymously</p>
                            <p className="text-xs text-gray-400">Your name will not be shown</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, isAnonymous: !f.isAnonymous }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                form.isAnonymous ? 'bg-gray-900' : 'bg-gray-200'
                            }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                form.isAnonymous ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 flex gap-3">
                    <button
                        type="button"
                        onClick={closeForm}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={submitting || uploading}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {submitting && <FiLoader size={14} className="animate-spin" />}
                        {isEdit ? 'Update Review' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
}