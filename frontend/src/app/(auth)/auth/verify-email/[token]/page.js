'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmail() {
    const [verificationStatus, setVerificationStatus] = useState('verifying');
    const { verifyEmail } = useAuth();
    const router = useRouter();
    const params = useParams();
    const token = params?.token;

    useEffect(() => {
        const verifyUserEmail = async () => {
            if (!token) {
                setVerificationStatus('failed');
                return;
            }

            try {
                await verifyEmail(token);
                setVerificationStatus('success');
            } catch (error) {
                console.error('Email verification error:', error);
                setVerificationStatus('failed');
            }
        };

        verifyUserEmail();
    }, [token, verifyEmail]);

    return (
        <div className="min-h-screen flex items-center justify-center text-black bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                {verificationStatus === 'verifying' && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mt-4">Verifying your email...</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Please wait while we verify your email address.
                        </p>
                    </div>
                )}

                {verificationStatus === 'success' && (
                    <div className="text-center">
                        <div className="bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
                            <FiCheck className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mt-4">Email Verified!</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your email address has been successfully verified. You can now log in to your account.
                        </p>

                        <div className="mt-8">
                            <Link
                                href="/auth/login"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                            >
                                Go to Login
                            </Link>
                        </div>
                    </div>
                )}

                {verificationStatus === 'failed' && (
                    <div className="text-center">
                        <div className="bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
                            <FiX className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mt-4">Verification Failed</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            We couldn't verify your email address. The verification link may be invalid or expired.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div>
                                <Link
                                    href="/auth/login"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded inline-flex items-center"
                                >
                                    <FiArrowLeft className="mr-2" />
                                    Back to Login
                                </Link>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mt-4">
                                    Need help? <Link href="/contact" className="text-blue-600 hover:text-blue-500">Contact support</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 