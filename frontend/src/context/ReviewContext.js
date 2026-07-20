"use client";
import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const ReviewContext = createContext();
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function ReviewProvider({ children, product }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState(null);
  const [mediaModal, setMediaModal] = useState({
    open: false,
    items: [],
    startIndex: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const pendingVoteRef = useRef({});

  const statsRef = useRef(false);
  const fetchReviews = useCallback(
    async (page = 1, append = false) => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const params = { page, limit: 10, sort: sortBy };
        if (filterRating) params.rating = filterRating;

        const { data } = await axios.get(
          `${API}/api/products/${product._id}/reviews`,
          { params, withCredentials: true },
        );

        setReviews((prev) =>
          append ? [...prev, ...data.reviews] : data.reviews,
        );
        setPagination(data.pagination);

        if (data.stats && !statsRef.current) {
          setStats(data.stats);
          statsRef.current = true;
        }
      } catch (err) {
        console.error("Reviews fetch failed:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sortBy, filterRating, product?._id],
  );

  useEffect(() => {
    statsRef.current = false;
    fetchReviews(1, false);
  }, [fetchReviews]);

  const scheduleVoteSync = useCallback(
    (reviewId, targetState) => {
      const pending = pendingVoteRef.current[reviewId];
      if (pending?.timeoutId) clearTimeout(pending.timeoutId);

      const timeoutId = setTimeout(async () => {
        delete pendingVoteRef.current[reviewId];
        try {
          const endpoint =
            targetState === "like"
              ? "like"
              : targetState === "dislike"
                ? "dislike"
                : null;

          const { data } = await axios.post(
            `${API}/api/reviews/${reviewId}/${endpoint}`,
            {},
            { withCredentials: true },
          );
          setReviews((prev) =>
            prev.map((r) => (r._id === reviewId ? { ...r, ...data } : r)),
          );
        } catch {
          toast.error("Failed to save your vote");

          fetchReviews(pagination.page, false);
        }
      }, 6000);

      pendingVoteRef.current[reviewId] = { timeoutId, targetState };
    },
    [fetchReviews, pagination.page],
  );

  const handleLike = (reviewId) => {
    if (!user) {
      toast.error("Please login to like reviews");
      return;
    }
    setReviews((prev) =>
      prev.map((r) => {
        if (r._id !== reviewId) return r;
        const wasLiked = r.isLiked;
        return {
          ...r,
          isLiked: !wasLiked,
          isDisliked: false,
          likesCount: wasLiked ? r.likesCount - 1 : r.likesCount + 1,
          dislikesCount: r.isDisliked ? r.dislikesCount - 1 : r.dislikesCount,
        };
      }),
    );
    const current = reviews.find((r) => r._id === reviewId);
    const nextState = current?.isLiked ? "none" : "like";

    scheduleVoteSync(reviewId, nextState);
  };

  const handleDislike = (reviewId) => {
    if (!user) {
      toast.error("Please login to rate reviews");
      return;
    }
    setReviews((prev) =>
      prev.map((r) => {
        if (r._id !== reviewId) return r;
        const wasDisliked = r.isDisliked;
        return {
          ...r,
          isDisliked: !wasDisliked,
          isLiked: false,
          dislikesCount: wasDisliked
            ? r.dislikesCount - 1
            : r.dislikesCount + 1,
          likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount,
        };
      }),
    );
    const current = reviews.find((r) => r._id === reviewId);
    const nextState = current?.isDisliked ? "none" : "dislike";
    scheduleVoteSync(reviewId, nextState);
  };

  const handleReport = async (reviewId, title, details) => {
    try {
      await axios.post(
        `${API}/api/reviews/${reviewId}/report`,
        { title, details },
        { withCredentials: true },
      );
      toast.success("Review reported. Thank you.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to report review");
    }
  };

  const handleEdit = async (reviewId, formData) => {
    const oldReview = editingReview;
    const { data } = await axios.put(
      `${API}/api/reviews/${reviewId}`,
      formData,
      { withCredentials: true },
    );
    const updated = data.review || data.data || data;

    setReviews((prev) =>
      prev.map((r) =>
        r._id === reviewId
          ? {
              ...r,
              ...updated,
              displayName: updated.isAnonymous
                ? "Anonymous"
                : updated.user?.name || r.displayName,
              userAvatar: updated.isAnonymous
                ? null
                : updated.user?.profilePicture?.url || r.userAvatar,
              likesCount: r.likesCount,
              dislikesCount: r.dislikesCount,
              isLiked: r.isLiked,
              isDisliked: r.isDisliked,
              isOwner: r.isOwner,
            }
          : r,
      ),
    );

    if (oldReview) {
      setStats((prev) => {
        if (!prev) return prev;
        let next = { ...prev };

        if (oldReview.rating !== updated.rating) {
          const total = prev.totalReviews;
          const newAvg =
            (prev.avgRating * total - oldReview.rating + updated.rating) /
            total;
          const dist = { ...prev.ratingDistribution };
          dist[oldReview.rating] = Math.max(
            0,
            (dist[oldReview.rating] || 0) - 1,
          );
          dist[updated.rating] = (dist[updated.rating] || 0) + 1;
          next = {
            ...next,
            avgRating: Math.round(newAvg * 10) / 10,
            ratingDistribution: dist,
          };
        }

        if (oldReview.fitFeedback !== updated.fitFeedback) {
          const fitCounts = { ...prev.fitCounts };
          if (oldReview.fitFeedback) {
            fitCounts[oldReview.fitFeedback] = Math.max(
              0,
              (fitCounts[oldReview.fitFeedback] || 0) - 1,
            );
          }
          if (updated.fitFeedback) {
            fitCounts[updated.fitFeedback] =
              (fitCounts[updated.fitFeedback] || 0) + 1;
          }
          next = { ...next, fitCounts };
        }

        return next;
      });
    }

    closeForm();
    toast.success("Review updated!");
  };

  const handleSubmit = async (formData) => {
    const { data } = await axios.post(
      `${API}/api/products/${product._id}/reviews`,
      formData,
      { withCredentials: true },
    );

    const created = data.review || data.data || data;

    const newReview = {
      ...created,
      displayName: created.isAnonymous
        ? "Anonymous"
        : created.user?.name || "You",
      userAvatar: created.isAnonymous
        ? null
        : created.user?.profilePicture?.url || null,
      likesCount: 0,
      dislikesCount: 0,
      isLiked: false,
      isDisliked: false,
      isOwner: true,
    };

    setReviews((prev) => [newReview, ...prev]);
    setPagination((prev) => ({ ...prev, total: prev.total + 1 }));

    setStats((prev) => {
      if (!prev) {
        return {
          avgRating: newReview.rating,
          totalReviews: 1,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            [newReview.rating]: 1,
          },
          fitCounts: newReview.fitFeedback
            ? { [newReview.fitFeedback]: 1 }
            : {},
        };
      }
      const newTotal = prev.totalReviews + 1;
      const newAvg =
        (prev.avgRating * prev.totalReviews + newReview.rating) / newTotal;
      const dist = { ...prev.ratingDistribution };
      dist[newReview.rating] = (dist[newReview.rating] || 0) + 1;

      const fitCounts = { ...prev.fitCounts };
      if (newReview.fitFeedback) {
        fitCounts[newReview.fitFeedback] =
          (fitCounts[newReview.fitFeedback] || 0) + 1;
      }

      return {
        ...prev,
        avgRating: Math.round(newAvg * 10) / 10,
        totalReviews: newTotal,
        ratingDistribution: dist,
        fitCounts,
      };
    });

    closeForm();
    toast.success("Review published!");
  };

  const loadMore = () => {
    if (pagination.page < pagination.pages && !loadingMore)
      fetchReviews(pagination.page + 1, true);
  };

  const openMediaModal = (items, startIndex = 0) =>
    setMediaModal({ open: true, items, startIndex });
  const closeMediaModal = () =>
    setMediaModal({ open: false, items: [], startIndex: 0 });

  const openForm = (review = null) => {
    setEditingReview(review);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        stats,
        pagination,
        loading,
        loadingMore,
        sortBy,
        setSortBy,
        filterRating,
        setFilterRating,
        handleLike,
        handleDislike,
        handleReport,
        handleEdit,
        handleSubmit,
        loadMore,
        mediaModal,
        openMediaModal,
        closeMediaModal,
        showForm,
        editingReview,
        openForm,
        closeForm,
        product,
        currentUser: user,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export const useReviews = () => useContext(ReviewContext);
