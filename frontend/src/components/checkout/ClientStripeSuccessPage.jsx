'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { checkoutApi } from '@/lib/checkoutApi';
import { useCart } from '@/context/CartContext';

const POLL_INTERVAL = 2000;
const MAX_ATTEMPTS = 15; // ~30 seconds

export default function ClientStripeSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const { clearCart, syncNow } = useCart();
    const [status, setStatus] = useState('waiting'); // waiting | found | timeout
    const [order, setOrder] = useState(null);
    const attemptsRef = useRef(0);
    const clearedRef = useRef(false);

    useEffect(() => {
        if (!sessionId) {
            setStatus('timeout');
            return;
        }

        let timer;
        const poll = async () => {
            try {
                const data = await checkoutApi.getBySessionId(sessionId);
                setOrder(data);
                setStatus('found');
                if (!clearedRef.current) {
                    clearCart();
                    syncNow();
                    clearedRef.current = true;
                }
                return;
            } catch {
                attemptsRef.current += 1;
                if (attemptsRef.current >= MAX_ATTEMPTS) {
                    setStatus('timeout');
                    return;
                }
                timer = setTimeout(poll, POLL_INTERVAL);
            }
        };

        poll();
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    if (status === 'waiting') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <Loader2 size={48} className="mx-auto text-gray-400 mb-6 animate-spin" />
                <h1 className="text-2xl font-bold mb-2">Confirming your payment...</h1>
                <p className="text-gray-500">This usually takes just a few seconds.</p>
            </div>
        );
    }

    if (status === 'timeout') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-2">Still processing</h1>
                <p className="text-gray-500 mb-8">
                    Your payment is being confirmed. Check your order history in a moment — you'll get a notification once it's ready.
                </p>
                <button onClick={() => router.push('/profile/orders')} className="bg-black text-white px-6 py-3 rounded-xl font-medium">
                    Go to My Orders
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <CheckCircle2 size={56} className="mx-auto text-green-600 mb-6" />
            <h1 className="text-3xl font-bold mb-2">Order placed successfully!</h1>
            <p className="text-gray-500 mb-8">Order #{order.orderNumber} confirmed.</p>
            <div className="flex items-center justify-center gap-4">
                <button onClick={() => router.push(`/profile/orders/${order._id}`)} className="bg-black text-white px-6 py-3 rounded-xl font-medium">
                    View Order
                </button>
                <button onClick={() => router.push('/products')} className="border px-6 py-3 rounded-xl font-medium">
                    Continue Shopping
                </button>
            </div>
        </div>
    );
}