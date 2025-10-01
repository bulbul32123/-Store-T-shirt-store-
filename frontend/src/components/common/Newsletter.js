'use client';

import { useState } from 'react';
import { FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        try {
            setLoading(true);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real application, you would make an API call to subscribe the user
            // await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`, { email });

            toast.success('Thank you for subscribing to our newsletter!');
            setEmail('');
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            toast.error('Failed to subscribe. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-16 bg-gray-100">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <FiMail className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
                    <p className="text-gray-600 mb-8">
                        Stay updated with our latest designs, exclusive offers, and fashion tips.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                        <input
                            type="email"
                            placeholder="Your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {loading ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </form>

                    <p className="text-gray-500 text-sm mt-4">
                        We respect your privacy. Unsubscribe at any time.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Newsletter; 