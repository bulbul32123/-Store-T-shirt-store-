import React, { useState, useRef } from 'react';
import { Upload, Download, ImageIcon, Loader2, X, RotateCcw, Trash2, Eye } from 'lucide-react';

export default function BackgroundRemover() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [processingMode, setProcessingMode] = useState('single'); // 'single' or 'batch'
  const fileInputRef = useRef(null);

  // Your Node.js server URL
  const API_BASE_URL = 'http://localhost:5000';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      handleFileSelect(filesArray);
    }
  };

  const handleFileSelect = (files) => {
    const validFiles = [];
    const validPreviews = [];
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError('Please select valid image files only');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size should be less than 10MB');
        return;
      }

      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        validPreviews.push({
          file: file,
          url: e.target.result,
          name: file.name
        });
        
        if (validPreviews.length === validFiles.length) {
          setPreviewUrls(validPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles(validFiles);
    setError('');
    setProcessedImages([]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      handleFileSelect(filesArray);
    }
  };

  const removeBackground = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setError('');

    try {
      if (processingMode === 'single' || selectedFiles.length === 1) {
        // Single file processing
        const formData = new FormData();
        formData.append('image', selectedFiles[0]);

        const response = await fetch(`${API_BASE_URL}/api/upload/remove-background`, {
          method: 'POST',
          body: formData,
          credentials: 'include' // Include cookies for auth
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to remove background');
        }

        setProcessedImages([data.data]);
      } else {
        // Batch processing
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });

        const response = await fetch(`${API_BASE_URL}/api/upload/remove-background/batch`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to remove backgrounds');
        }

        setProcessedImages(data.data.processed || []);
        
        if (data.data.errors && data.data.errors.length > 0) {
          setError(`Some files failed: ${data.data.errors.map(e => e.originalFilename).join(', ')}`);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Background removal error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `bg-removed-${filename || Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const downloadAllImages = async () => {
    for (let i = 0; i < processedImages.length; i++) {
      const img = processedImages[i];
      await downloadImage(img.processedImageUrl, img.originalFilename);
      
      // Small delay between downloads
      if (i < processedImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const deleteProcessedImage = async (publicId, index) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/processed/${publicId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setProcessedImages(prev => prev.filter((_, i) => i !== index));
      }
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  };

  const resetAll = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    setProcessedImages([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePreview = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Background Remover
          </h1>
          <p className="text-gray-600 mb-4">
            Remove backgrounds from your images instantly with AI-powered precision
          </p>
          
          {/* Processing Mode Toggle */}
          <div className="flex justify-center items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="mode"
                value="single"
                checked={processingMode === 'single'}
                onChange={(e) => setProcessingMode(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium">Single Image</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="mode"
                value="batch"
                checked={processingMode === 'batch'}
                onChange={(e) => setProcessingMode(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium">Batch Processing</span>
            </label>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Upload className="mr-2" size={20} />
                Upload Images
              </h2>
              
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple={processingMode === 'batch'}
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="text-blue-600" size={24} />
                  </div>
                  
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drop your {processingMode === 'batch' ? 'images' : 'image'} here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports: JPG, PNG, WEBP, GIF (Max 10MB each)
                      {processingMode === 'batch' && ' • Up to 5 images'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <X className="text-red-500 mr-2 flex-shrink-0" size={16} />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {/* Preview Grid */}
              {previewUrls.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium text-gray-700">Selected Images ({previewUrls.length})</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {previewUrls.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover bg-gray-50 rounded-lg"
                        />
                        <button
                          onClick={() => removePreview(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{preview.name}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={removeBackground}
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Processing{processingMode === 'batch' ? ' Batch' : ''}...
                        </>
                      ) : (
                        `Remove Background${processingMode === 'batch' ? 's' : ''}`
                      )}
                    </button>
                    
                    <button
                      onClick={resetAll}
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <ImageIcon className="mr-2" size={20} />
                  Results ({processedImages.length})
                </h2>
                {processedImages.length > 1 && (
                  <button
                    onClick={downloadAllImages}
                    className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 flex items-center"
                  >
                    <Download size={14} className="mr-1" />
                    Download All
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {processedImages.length === 0 && !isProcessing && (
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                    <div className="text-center text-gray-500">
                      <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Processed images will appear here</p>
                    </div>
                  </div>
                )}
                
                {isProcessing && (
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                      <p className="text-gray-600">Removing background{processingMode === 'batch' ? 's' : ''}...</p>
                      <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
                    </div>
                  </div>
                )}
                
                {processedImages.length > 0 && (
                  <div className="grid gap-4">
                    {processedImages.map((image, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700 truncate">
                            {image.originalFilename || `Image ${index + 1}`}
                          </h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open(image.processedImageUrl, '_blank')}
                              className="p-1 text-blue-600 hover:text-blue-700"
                              title="View full size"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => downloadImage(image.processedImageUrl, image.originalFilename)}
                              className="p-1 text-green-600 hover:text-green-700"
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => deleteProcessedImage(image.publicId, index)}
                              className="p-1 text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <img
                            src={image.processedImageUrl}
                            alt={`Processed ${index + 1}`}
                            className="w-full h-48 object-contain bg-transparent rounded-lg"
                            style={{
                              backgroundImage: `linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                                               linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                                               linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                                               linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)`,
                              backgroundSize: '20px 20px',
                              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                            }}
                          />
                        </div>
                        
                        {image.format && (
                          <div className="mt-2 text-xs text-gray-500">
                            Format: {image.format.toUpperCase()} • 
                            {image.width && image.height && ` ${image.width}×${image.height}`}
                            {image.bytes && ` • ${Math.round(image.bytes / 1024)}KB`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Features Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-700">AI-Powered Precision</p>
                    <p className="text-sm text-gray-600">Advanced AI algorithms for accurate background removal</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-700">Batch Processing</p>
                    <p className="text-sm text-gray-600">Process up to 5 images simultaneously</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-700">High Quality Output</p>
                    <p className="text-sm text-gray-600">Maintain image quality with transparent PNG output</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-700">Cloud Storage</p>
                    <p className="text-sm text-gray-600">Secure processing with Cloudinary infrastructure</p>
                  </div>
                </div>
              </div>
            </div>

            {/* API Status */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Connection</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Background Removal</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Batch Processing</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}