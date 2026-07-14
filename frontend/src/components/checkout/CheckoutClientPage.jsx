'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkoutApi } from '@/lib/checkoutApi';
import RewardBanner from '@/components/profile/cart/RewardBanner';
import toast from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/lib/ordersApi';
import { couponApi } from '@/lib/couponApi';
import { API_URL } from '@/utils/config';
import CouponBox from '@/components/profile/cart/CouponBox';

const FREE_SHIPPING_THRESHOLD = 100;
const STANDARD_SHIPPING_FEE = 10;
const TAX = 5;

export default function CheckoutClientPage() {
    const router = useRouter();
    const { items, subtotal, clearCart, syncNow } = useCart();
const { user, loading: authLoading, isAuthenticated, updateProfile } = useAuth();

    const [address, setAddress] = useState({
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        postalCode: user?.address?.postalCode || '',
        country: user?.address?.country || '',
    });
    const [phone, setPhone] = useState(user?.phoneNumber || '');
    const [saveAddress, setSaveAddress] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const discount = appliedCoupon?.discountAmount || 0;
    const total = Math.max(subtotal + shipping + TAX - discount, 0);

    const handleApplyCoupon = async (code) => {
        setCouponLoading(true);
        try {
            const res = await couponApi.validate(code, subtotal);
            setAppliedCoupon(res.data);
            toast.success(res.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid coupon');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => setAppliedCoupon(null);

const handlePlaceOrder = async () => {
        if (!items.length) return toast.error('Your cart is empty');

        const required = ['street', 'city', 'state', 'postalCode', 'country'];
        for (const field of required) {
            if (!address[field]?.trim()) {
                return toast.error('Please fill in your full shipping address');
            }
        }

        setPlacingOrder(true);
        try {
            if (saveAddress) {
                await updateProfile({ address, phoneNumber: phone });
            }

            const payload = {
                orderItems: items.map((i) => ({
                    product: i.productId,
                    quantity: i.quantity,
                    size: i.size,
                    color: i.color,
                    image: i.image,
                })),
                shippingAddress: address,
                phone,
                couponCode: appliedCoupon?.code || undefined,
            };

            if (paymentMethod === 'card') {
                const { url } = await checkoutApi.createSession(payload);
                sessionStorage.removeItem('appliedCoupon');
                window.location.href = url; // redirect to Stripe
                return;
            }

            const { order, rewardCoupon } = await ordersApi.create({ ...payload, paymentMethod });
            clearCart();
            syncNow();
            sessionStorage.removeItem('appliedCoupon');
            if (rewardCoupon) sessionStorage.setItem('lastReward', JSON.stringify(rewardCoupon));
            toast.success('Order placed successfully!');
            router.push(`/checkout/success/${order._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacingOrder(false);
        }
    };



if (authLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">Loading...</div>;
}

if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
}
    if (!items.length) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
                <p className="text-gray-500">Add items to your cart before checking out.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
            <h1 className="text-4xl font-bold mb-10">Checkout</h1>

            <div className="grid lg:grid-cols-[1fr_380px] gap-10">
                <div className="space-y-8">
                    {/* Shipping Address */}
                    <div>
                        <h2 className="font-bold text-xl mb-4">Shipping Address</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                className="col-span-2 border rounded-xl px-4 py-3"
                                placeholder="Street address"
                                value={address.street}
                                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                            />
                            <input
                                className="border rounded-xl px-4 py-3"
                                placeholder="City"
                                value={address.city}
                                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            />
                            <input
                                className="border rounded-xl px-4 py-3"
                                placeholder="State"
                                value={address.state}
                                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            />
                            <input
                                className="border rounded-xl px-4 py-3"
                                placeholder="Postal code"
                                value={address.postalCode}
                                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                            />
                            <input
                                className="border rounded-xl px-4 py-3"
                                placeholder="Country"
                                value={address.country}
                                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                            />
                            <input
                                className="col-span-2 border rounded-xl px-4 py-3"
                                placeholder="Phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <label className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={saveAddress}
                                onChange={(e) => setSaveAddress(e.target.checked)}
                            />
                            Save this address to my profile
                        </label>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <h2 className="font-bold text-xl mb-4">Payment Method</h2>
                        <div className="space-y-2">
                            {[
                                { id: 'cod', label: 'Cash on Delivery' },
                                { id: 'card', label: 'Credit / Debit Card' },
                            ].map((method) => (
                                <label
                                    key={method.id}
                                    className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer ${
                                        paymentMethod === method.id ? 'border-black' : 'border-gray-200'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        checked={paymentMethod === method.id}
                                        onChange={() => setPaymentMethod(method.id)}
                                    />
                                    {method.label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div>
                    <div className="lg:sticky lg:top-24 border rounded-3xl p-6">
                        <h2 className="font-bold text-xl mb-6">Order Summary</h2>

                        <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                            {items.map((item) => (
                                <div key={item.lineId} className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        {item.name} × {item.quantity}
                                    </span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 text-sm border-t pt-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>${TAX}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>Discount</span>
                                    <span>-${discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={placingOrder}
                            className="w-full mt-6 bg-black text-white rounded-xl py-4 font-medium disabled:opacity-50"
                        >
                            {placingOrder ? 'Placing Order...' : 'Place Order'}
                        </button>
<RewardBanner onClaim={handleApplyCoupon} />
                        <CouponBox
                            onApply={handleApplyCoupon}
                            onRemove={handleRemoveCoupon}
                            appliedCoupon={appliedCoupon}
                            loading={couponLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}