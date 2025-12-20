// hooks/useBgRemover.js - Custom hook for background removal
"use client"
import { bgRemoverAPI } from '@/lib/api';
import { useState, useCallback } from 'react';

export const useBgRemover = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const removeBackground = useCallback(async (file) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await bgRemoverAPI.removeBackground(file);
      setResult(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    removeBackground,
    isProcessing,
    error,
    result,
    reset
  };
};
