'use client';

import { useState } from 'react';

const INITIAL_FORM = {
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscountAmount: '',
    minPurchaseAmount: '',
    usageLimit: '',
    perUserLimit: '',
    expiryDate: '',
    isActive: true
};

export default function CouponFormModal({ isOpen, onClose, onSubmit }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validate = () => {
        const next = {};
        if (!form.code.trim()) next.code = 'Coupon code is required';
        if (!form.discountValue || Number(form.discountValue) <= 0) {
            next.discountValue = 'Enter a discount value greater than 0';
        } else if (form.discountType === 'percentage' && Number(form.discountValue) > 100) {
            next.discountValue = 'Percentage discount cannot exceed 100';
        }
        if (!form.expiryDate) next.expiryDate = 'Expiry date is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const closeAndReset = () => {
        setForm(INITIAL_FORM);
        setErrors({});
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await onSubmit({
                code: form.code.trim().toUpperCase(),
                description: form.description.trim(),
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
                minPurchaseAmount: form.minPurchaseAmount ? Number(form.minPurchaseAmount) : 0,
                usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
                expiryDate: form.expiryDate,
                isActive: form.isActive
            });
            closeAndReset();
        } catch (err) {
            setErrors((prev) => ({ ...prev, form: err.message || 'Something went wrong' }));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Create Coupon</h2>
                    <button
                        type="button"
                        onClick={closeAndReset}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto px-6 py-5">
                    {errors.form && (
                        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.form}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Coupon Code</label>
                            <input
                                name="code"
                                value={form.code}
                                onChange={handleChange}
                                placeholder="e.g. SUMMER20"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                            <input
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Optional internal note"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Discount Type</label>
                            <select
                                name="discountType"
                                value={form.discountType}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Discount Value {form.discountType === 'percentage' ? '(%)' : '($)'}
                            </label>
                            <input
                                type="number"
                                name="discountValue"
                                value={form.discountValue}
                                onChange={handleChange}
                                min="0"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.discountValue && <p className="mt-1 text-xs text-red-600">{errors.discountValue}</p>}
                        </div>

                        {form.discountType === 'percentage' && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Max Discount ($)</label>
                                <input
                                    type="number"
                                    name="maxDiscountAmount"
                                    value={form.maxDiscountAmount}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="No cap"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Min Purchase ($)</label>
                            <input
                                type="number"
                                name="minPurchaseAmount"
                                value={form.minPurchaseAmount}
                                onChange={handleChange}
                                min="0"
                                placeholder="0"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Usage Limit</label>
                            <input
                                type="number"
                                name="usageLimit"
                                value={form.usageLimit}
                                onChange={handleChange}
                                min="1"
                                placeholder="Unlimited"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Per-User Limit</label>
                            <input
                                type="number"
                                name="perUserLimit"
                                value={form.perUserLimit}
                                onChange={handleChange}
                                min="1"
                                placeholder="Unlimited"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Expiry Date</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={form.expiryDate}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.expiryDate && <p className="mt-1 text-xs text-red-600">{errors.expiryDate}</p>}
                        </div>

                        <div className="col-span-2 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={form.isActive}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="isActive" className="text-sm text-gray-700">
                                Activate immediately
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={closeAndReset}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {submitting ? 'Creating…' : 'Create Coupon'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}