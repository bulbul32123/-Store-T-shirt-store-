'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ReviewContext = createContext();
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function ReviewProvider({ children, product }) {
    const { user } = useAuth();

    // ── Data ─────────────────────────────────────────────────────────────────
    const [reviews,    setReviews]    = useState([]);
    const [stats,      setStats]      = useState(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });

    // ── UI ────────────────────────────────────────────────────────────────────
    const [loading,      setLoading]      = useState(true);
    const [loadingMore,  setLoadingMore]  = useState(false);
    const [sortBy,       setSortBy]       = useState('newest');
    const [filterRating, setFilterRating] = useState(null);

    // ── Modals ────────────────────────────────────────────────────────────────
    const [mediaModal,     setMediaModal]     = useState({ open: false, items: [], startIndex: 0 });
    const [showForm,       setShowForm]       = useState(false);
    const [editingReview,  setEditingReview]  = useState(null);

    const statsRef = useRef(false);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchReviews = useCallback(async (page = 1, append = false) => {
        if (page === 1) setLoading(true); else setLoadingMore(true);
        try {
            const params = { page, limit: 10, sort: sortBy };
            if (filterRating) params.rating = filterRating;

            const { data } = await axios.get(
                `${API}/api/products/${product._id}/reviews`,
                { params, withCredentials: true }
            );

            setReviews(prev => append ? [...prev, ...data.reviews] : data.reviews);
            setPagination(data.pagination);

            if (data.stats && !statsRef.current) {
                setStats(data.stats);
                statsRef.current = true;
            }
        } catch (err) {
            console.error('Reviews fetch failed:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [ sortBy, filterRating]);

    useEffect(() => {
        statsRef.current = false;
        fetchReviews(1, false);
    }, [fetchReviews]);

    // ── Like — optimistic ─────────────────────────────────────────────────────
    const handleLike = async (reviewId) => {
        if (!user) { toast.error('Please login to like reviews'); return; }
        const snapshot = [...reviews];
        setReviews(prev => prev.map(r => {
            if (r._id !== reviewId) return r;
            const wasLiked = r.isLiked;
            return {
                ...r,
                isLiked:       !wasLiked,
                isDisliked:    false,
                likesCount:    wasLiked ? r.likesCount - 1 : r.likesCount + 1,
                dislikesCount: r.isDisliked ? r.dislikesCount - 1 : r.dislikesCount,
            };
        }));
        try {
            const { data } = await axios.post(`${API}/api/reviews/${reviewId}/like`, {}, { withCredentials: true });
            setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, ...data } : r));
        } catch {
            setReviews(snapshot);
            toast.error('Failed to update');
        }
    };

    // ── Dislike — optimistic ──────────────────────────────────────────────────
    const handleDislike = async (reviewId) => {
        if (!user) { toast.error('Please login to rate reviews'); return; }
        const snapshot = [...reviews];
        setReviews(prev => prev.map(r => {
            if (r._id !== reviewId) return r;
            const wasDisliked = r.isDisliked;
            return {
                ...r,
                isDisliked:    !wasDisliked,
                isLiked:       false,
                dislikesCount: wasDisliked ? r.dislikesCount - 1 : r.dislikesCount + 1,
                likesCount:    r.isLiked ? r.likesCount - 1 : r.likesCount,
            };
        }));
        try {
            const { data } = await axios.post(`${API}/api/reviews/${reviewId}/dislike`, {}, { withCredentials: true });
            setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, ...data } : r));
        } catch {
            setReviews(snapshot);
            toast.error('Failed to update');
        }
    };

    // ── Report ────────────────────────────────────────────────────────────────
    const handleReport = async (reviewId, reason) => {
        try {
            await axios.post(`${API}/api/reviews/${reviewId}/report`, { reason }, { withCredentials: true });
            toast.success('Review reported. Thank you.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to report review');
        }
    };

    // ── Edit (owner only — resets to pending) ─────────────────────────────────
    const handleEdit = async (reviewId, formData) => {
        await axios.put(`${API}/api/reviews/${reviewId}`, formData, { withCredentials: true });
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        closeForm();
        statsRef.current = false;
        toast.success('Review updated! It will reappear after re-moderation.');
    };

    // ── Submit new ────────────────────────────────────────────────────────────
    const handleSubmit = async (formData) => {
        await axios.post(
            `${API}/api/products/${product._id}/reviews`,
            formData,
            { withCredentials: true }
        );
        closeForm();
        toast.success('Review submitted! It will appear after moderation.');
    };

    // ── Load more ─────────────────────────────────────────────────────────────
    const loadMore = () => {
        if (pagination.page < pagination.pages && !loadingMore)
            fetchReviews(pagination.page + 1, true);
    };

    // ── Media modal ───────────────────────────────────────────────────────────
    const openMediaModal  = (items, startIndex = 0) => setMediaModal({ open: true, items, startIndex });
    const closeMediaModal = () => setMediaModal({ open: false, items: [], startIndex: 0 });

    // ── Review form ───────────────────────────────────────────────────────────
    const openForm  = (review = null) => { setEditingReview(review); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setEditingReview(null); };

    return (
        <ReviewContext.Provider value={{
            reviews, stats, pagination, loading, loadingMore,
            sortBy, setSortBy,
            filterRating, setFilterRating,
            handleLike, handleDislike, handleReport, handleEdit, handleSubmit,
            loadMore,
            mediaModal, openMediaModal, closeMediaModal,
            showForm, editingReview, openForm, closeForm,
            product,
            currentUser: user,
        }}>
            {children}
        </ReviewContext.Provider>
    );
}

export const useReviews = () => useContext(ReviewContext);