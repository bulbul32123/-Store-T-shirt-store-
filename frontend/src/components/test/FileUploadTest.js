'use client';

import { useState, useRef } from 'react';
import axios from 'axios';

const FileUploadTest = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setStatus(`Selected file: ${e.target.files[0].name}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setStatus('Please select a file first');
            return;
        }

        setStatus('Uploading...');

        // Create a simple FormData with just one file
        const formData = new FormData();
        formData.append('testImage', file);

        try {
            // Log FormData contents
            console.log('FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value instanceof File ? value.name : value}`);
            }

            // Send the file to a test endpoint
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/upload/test`,
                formData
            );

            setStatus(`Upload successful: ${response.data.url}`);
        } catch (error) {
            console.error('Upload error:', error);
            setStatus(`Upload failed: ${error.message}`);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">File Upload Test</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Test Image Upload
                    </label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                    />
                </div>

                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Upload File
                </button>
            </form>

            {status && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p>{status}</p>
                </div>
            )}
        </div>
    );
};

export default FileUploadTest; 