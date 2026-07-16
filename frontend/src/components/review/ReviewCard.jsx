"use client";
import { useState, useRef, useEffect } from "react";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiMoreVertical,
  FiEdit2,
  FiFlag,
  FiShield,
  FiVideo,
  FiX,
} from "react-icons/fi";
import { useReviews } from "@/context/ReviewContext";
import toast from "react-hot-toast";

const REPORT_REASONS = [
  "Inappropriate content",
  "Spam or fake review",
  "Irrelevant to product",
  "Offensive language",
  "Other",
];

const FIT_COLORS = {
  "Too Small": "bg-amber-100 text-amber-700",
  "True to Size": "bg-emerald-100 text-emerald-700",
  "Too Large": "bg-indigo-100 text-indigo-700",
};

function Stars({ value, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 20 20">
          <path
            fill={n <= value ? "#f59e0b" : "#e5e7eb"}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
    </div>
  );
}


function ReviewMenu({ review, onEdit, onReportSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative ">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <FiMoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-60 text-sm">
          {review.isOwner && (
            <button
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiEdit2 size={14} /> Edit review
            </button>
          )}
          {!review.isOwner && (
            <>
              <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Report reason
              </p>
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => {
                    setOpen(false);
                    onReportSelect(reason);
                  }}
                  className="w-full flex items-center justify-start gap-2.5 px-3 py-2 text-gray-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  <FiFlag size={13} /> {reason}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReviewCard({ review }) {
  const { handleLike, handleDislike, handleReport, openForm, openMediaModal } =
    useReviews();
  const [expanded, setExpanded] = useState(false);

  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const TEXT_LIMIT = 220;
  const longText = review.reviewText && review.reviewText.length > TEXT_LIMIT;
  const displayText =
    longText && !expanded
      ? `${review.reviewText.slice(0, TEXT_LIMIT)}…`
      : review.reviewText;

  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const mediaItems = [
    ...(review.images || []).map((img) => ({
      type: "image",
      url: img.url || img,
    })),
    ...(review.video?.url ? [{ type: "video", url: review.video.url }] : []),
  ];

  const handleReportSelect = (reason) => {
    setSelectedReason(reason);
    setReportDetails("");
    setIsReportModalOpen(true);
  };

  const submitReport = async () => {
    setSubmittingReport(true);
    try {
      await handleReport(review._id, selectedReason, reportDetails);
      setIsReportModalOpen(false);
    } catch (error) {
      toast.error("Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
      
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {review.userAvatar ? (
              <img
                src={review.userAvatar}
                alt=""
                className="h-10 w-10 object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-white">
                {review.displayName?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">
                {review.displayName}
              </span>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  <FiShield size={10} /> Verified
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Stars value={review.rating} />
          <ReviewMenu
            review={review}
            onEdit={() => openForm(review)}
            onReportSelect={handleReportSelect}
          />
        </div>
      </div>

      
      {(review.sizePurchased ||
        review.colorPurchased ||
        review.fitFeedback) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {review.sizePurchased && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              Size: {review.sizePurchased}
            </span>
          )}
          {review.colorPurchased && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              Color: {review.colorPurchased}
            </span>
          )}
          {review.fitFeedback && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${FIT_COLORS[review.fitFeedback] || "bg-gray-100 text-gray-600"}`}
            >
              {review.fitFeedback}
            </span>
          )}
        </div>
      )}

      
      <p className="text-sm text-gray-700 leading-relaxed mb-3">
        {displayText}
        {longText && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="ml-1 text-indigo-600 hover:text-indigo-800 font-semibold text-xs"
          >
            {expanded ? "show less" : "show more"}
          </button>
        )}
      </p>

      
      {mediaItems.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {mediaItems.map((item, i) => (
            <button
              key={i}
              onClick={() => openMediaModal(mediaItems, i)}
              className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-100 hover:border-gray-300 hover:scale-105 transition-all flex-shrink-0 bg-gray-100"
            >
              {item.type === "video" ? (
                <div className="h-full w-full flex items-center justify-center bg-gray-200">
                  <FiVideo size={18} className="text-gray-500" />
                </div>
              ) : (
                <img
                  src={item.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
          {mediaItems.length > 0 && (
            <button
              onClick={() => openMediaModal(mediaItems, 0)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium self-end mb-1 ml-1"
            >
              View all →
            </button>
          )}
        </div>
      )}

      
      <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400 mr-1">Helpful?</span>
        <button
          onClick={() => handleLike(review._id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            review.isLiked
              ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          <FiThumbsUp size={13} />
          Yes {review.likesCount > 0 && `(${review.likesCount})`}
        </button>
        <button
          onClick={() => handleDislike(review._id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            review.isDisliked
              ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          <FiThumbsDown size={13} />
          No {review.dislikesCount > 0 && `(${review.dislikesCount})`}
        </button>
      </div>

      
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay with Blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsReportModalOpen(false)}
          />

          
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 border border-gray-100 scale-100 animate-in fade-in zoom-in-95 duration-200 z-10">
            
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <FiX size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3 text-rose-600">
              <FiFlag size={20} className="fill-rose-100" />
              <h3 className="text-lg font-bold text-gray-900">Report Review</h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              You are reporting this review for:{" "}
              <strong className="text-gray-900">{selectedReason}</strong>
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Extra details (Optional)
              </label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Help our moderators understand the issue..."
                rows={4}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setIsReportModalOpen(false)}
                disabled={submittingReport}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={submittingReport}
                className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-lg shadow-rose-600/10 transition-all"
              >
                {submittingReport ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
