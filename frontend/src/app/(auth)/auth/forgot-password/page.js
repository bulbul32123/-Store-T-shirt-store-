'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const { forgotPassword, loading } = useAuth();

    const validateEmail = (email) => {
        const regex = /\S+@\S+\.\S+/;
        return regex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email) {
            setError('Email is required');
            return;
        }
        
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        
        try {
            await forgotPassword(email);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error sending reset email:', error);
            setError('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center text-black bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Forgot your password?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {!isSubmitted
                            ? "Enter your email address and we'll send you instructions to reset your password."
                            : "Check your email for instructions to reset your password."}
                    </p>
                </div>

                {!isSubmitted ? (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`block w-full pl-10 pr-3 py-2 border ${
                                        error ? 'border-red-300' : 'border-gray-300'
                                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="you@example.com"
                                    disabled={loading}
                                />
                            </div>
                            {error && (
                                <p className="mt-1 text-sm text-red-600">{error}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white font-medium ${
                                    loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <LoadingSpinner size="small" />
                                        <span className="ml-2">Sending...</span>
                                    </span>
                                ) : (
                                    'Send reset instructions'
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="mt-8 text-center">
                        <div className="rounded-md bg-green-50 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        We've sent password reset instructions to {email}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            If you don't see the email in your inbox, please check your spam folder.
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center mx-auto"
                        >
                            <FiArrowLeft className="mr-2" />
                            Try another email
                        </button>
                    </div>
                )}

                <div className="text-center mt-4">
                    <Link href="/auth/login" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center">
                        <FiArrowLeft className="mr-2" />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
} 