'use client';

import { useEffect, useRef } from 'react';
import { FiAlertTriangle, FiX, FiLoader } from 'react-icons/fi';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed with this action?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning', // warning, danger, info
    isLoading = false
}) {
    const modalRef = useRef(null);

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !isLoading) onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset'; // Restore scrolling when modal is closed
        };
    }, [isOpen, onClose, isLoading]);

    // Handle click outside
    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target) && !isLoading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    // Determine button and icon colors based on type
    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: 'text-red-500',
                    button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                };
            case 'info':
                return {
                    icon: 'text-blue-500',
                    button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
                };
            case 'warning':
            default:
                return {
                    icon: 'text-yellow-500',
                    button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
                };
        }
    };

    const typeStyles = getTypeStyles();

    return (
        <div className="fixed bg-transparent w-full h-screen inset-0 z-50">
            <div
                className="flex items-center justify-center h-full w-full pt-4 px-4 pb-20 text-center"
                onClick={handleClickOutside}
            >
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-200/50" aria-hidden="true"></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" ref={modalRef}>
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            <span className="sr-only">Close</span>
                            <FiX className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-${type === 'danger' ? 'red' : type === 'info' ? 'blue' : 'yellow'}-100 sm:mx-0 sm:h-10 sm:w-10`}>
                                <FiAlertTriangle className={`h-6 w-6 ${typeStyles.icon}`} aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${typeStyles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Processing...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                        <button
                            type="button"
                            className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 