const Review = require("../models/Review");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { notifyUser } = require("../utils/notify");
const { notifyAdmins } = require("../utils/notify");

const Order = require("../models/Order");

exports.submitReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      rating,
      reviewText,
      sizePurchased,
      colorPurchased,
      fitFeedback,
      images,
      video,
      isAnonymous,
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existing = await Review.findOne({
      product: productId,
      user: req.user._id,
      status: { $in: ["pending", "approved"] },
    });
    if (existing)
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });

    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      orderStatus: "delivered",
      "orderItems.product": productId,
    })
      .select("_id")
      .lean();

    if (!deliveredOrder) {
      return res.status(403).json({
        message:
          "You can only review products after your order has been delivered.",
      });
    }

    if (images && images.length > 3)
      return res.status(400).json({ message: "Maximum 3 images allowed" });
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      order: deliveredOrder._id,
      rating: Number(rating),
      reviewText,
      sizePurchased,
      colorPurchased,
      fitFeedback,
      images: images || [],
      video: video || undefined,
      isAnonymous: Boolean(isAnonymous),
      verifiedPurchase: true,
      status: "approved",
    });
    await recomputeProductRating(productId);

    await review.populate("user", "name profilePicture");
    notifyAdmins({
      type: "review_added",
      title: "New Review",
      message: `${review.user.name} left a ${review.rating}★ review`,
      link: `/admin/reviews?id=${review._id}`,
    });
    res.status(201).json({ message: "Review published", review });
  } catch (err) {
    console.error("submitReview:", err);
    res
      .status(500)
      .json({ message: "Failed to submit review", error: err.message });
  }
};

async function recomputeProductRating(productId) {
  const [agg] = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        status: "approved",
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);
  await Product.findByIdAndUpdate(productId, {
    averageRating: agg ? Math.round(agg.averageRating * 10) / 10 : 0,
    numReviews: agg ? agg.numReviews : 0,
  });
}

async function getUserIdFromCookie(req) {
  try {
    const token = req.cookies?.token;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id?.toString() || null;
  } catch {
    return null;
  }
}

function transformReview(r, currentUserId) {
  const likesArr = r.likes || [];
  const dislikesArr = r.dislikes || [];
  const userId = r.user?._id?.toString() || r.user?.toString();
  return {
    ...r,
    displayName: r.isAnonymous ? "Anonymous" : r.user?.name || "Unknown",
    userAvatar: r.isAnonymous ? null : r.user?.profilePicture?.url || null,
    likesCount: likesArr.length,
    dislikesCount: dislikesArr.length,
    isLiked: currentUserId
      ? likesArr.some((id) => id.toString() === currentUserId)
      : false,
    isDisliked: currentUserId
      ? dislikesArr.some((id) => id.toString() === currentUserId)
      : false,
    isOwner: currentUserId ? userId === currentUserId : false,
    likes: undefined,
    dislikes: undefined,
    reports: undefined,
    user: undefined,
  };
}
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = "newest", rating } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { product: productId, status: "approved" };
    if (rating) filter.rating = Number(rating);

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { rating: -1, createdAt: -1 },
      lowest: { rating: 1, createdAt: -1 },
    };

    const currentUserId = await getUserIdFromCookie(req);
    let reviews, total;

    if (sort === "most_liked") {
      const pipeline = [
        {
          $match: {
            ...filter,
            product: new mongoose.Types.ObjectId(productId),
          },
        },
        { $addFields: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userArr",
            pipeline: [{ $project: { name: 1, profilePicture: 1 } }],
          },
        },
        { $addFields: { user: { $arrayElemAt: ["$userArr", 0] } } },
        { $unset: ["userArr", "likesCount"] },
      ];
      [reviews, total] = await Promise.all([
        Review.aggregate(pipeline),
        Review.countDocuments(filter),
      ]);
    } else {
      [reviews, total] = await Promise.all([
        Review.find(filter)
          .populate("user", "name profilePicture")
          .sort(sortMap[sort] || sortMap.newest)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Review.countDocuments(filter),
      ]);
    }

    const [statsDoc] = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          total: { $sum: 1 },
          star5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          star4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          star3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          star2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          star1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
          tooSmall: {
            $sum: { $cond: [{ $eq: ["$fitFeedback", "Too Small"] }, 1, 0] },
          },
          trueToSize: {
            $sum: { $cond: [{ $eq: ["$fitFeedback", "True to Size"] }, 1, 0] },
          },
          tooLarge: {
            $sum: { $cond: [{ $eq: ["$fitFeedback", "Too Large"] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = statsDoc
      ? {
          avgRating: Math.round(statsDoc.avgRating * 10) / 10,
          totalReviews: statsDoc.total,
          ratingDistribution: {
            5: statsDoc.star5,
            4: statsDoc.star4,
            3: statsDoc.star3,
            2: statsDoc.star2,
            1: statsDoc.star1,
          },
          fitCounts: {
            "Too Small": statsDoc.tooSmall,
            "True to Size": statsDoc.trueToSize,
            "Too Large": statsDoc.tooLarge,
          },
        }
      : null;

    res.json({
      reviews: reviews.map((r) => transformReview(r, currentUserId)),
      stats,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (err) {
    console.error("getProductReviews:", err);
    res
      .status(500)
      .json({ message: "Failed to load reviews", error: err.message });
  }
};

exports.editReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "Not authorized to edit this review" });

    const {
      rating,
      reviewText,
      sizePurchased,
      colorPurchased,
      fitFeedback,
      images,
      video,
      isAnonymous,
    } = req.body;

    if (rating) review.rating = Number(rating);
    if (reviewText) review.reviewText = reviewText;
    if (sizePurchased) review.sizePurchased = sizePurchased;
    if (colorPurchased) review.colorPurchased = colorPurchased;
    if (fitFeedback) review.fitFeedback = fitFeedback;
    if (images) review.images = images;
    if (video !== undefined) review.video = video;
    if (isAnonymous !== undefined) review.isAnonymous = Boolean(isAnonymous);

    await review.save();
    await recomputeProductRating(review.product);
    await review.populate("user", "name profilePicture");

    res.json({ message: "Review updated", review });
  } catch (err) {
    console.error("editReview:", err);
    res
      .status(500)
      .json({ message: "Failed to edit review", error: err.message });
  }
};

exports.likeReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const alreadyLiked = review.likes.some((id) => id.equals(userId));
    if (alreadyLiked) {
      review.likes.pull(userId);
    } else {
      review.likes.push(userId);
      review.dislikes.pull(userId);
    }
    await review.save();

    res.json({
      likesCount: review.likes.length,
      dislikesCount: review.dislikes.length,
      isLiked: !alreadyLiked,
      isDisliked: false,
    });
  } catch (err) {
    console.error("likeReview:", err);
    res
      .status(500)
      .json({ message: "Failed to update like", error: err.message });
  }
};

exports.dislikeReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const alreadyDisliked = review.dislikes.some((id) => id.equals(userId));
    if (alreadyDisliked) {
      review.dislikes.pull(userId);
    } else {
      review.dislikes.push(userId);
      review.likes.pull(userId); 
    }
    await review.save();

    res.json({
      likesCount: review.likes.length,
      dislikesCount: review.dislikes.length,
      isLiked: false,
      isDisliked: !alreadyDisliked,
    });
  } catch (err) {
    console.error("dislikeReview:", err);
    res
      .status(500)
      .json({ message: "Failed to update dislike", error: err.message });
  }
};

exports.reportReview = async (req, res) => {
  try {
    const { title, details } = req.body;
    if (!title)
      return res.status(400).json({ message: "Report reason is required" });

    const review = await Review.findById(req.params.id).populate(
      "product",
      "name",
    );
    if (!review) return res.status(404).json({ message: "Review not found" });

    const alreadyReported = review.reports.some((r) =>
      r.user.equals(req.user._id),
    );
    if (alreadyReported)
      return res
        .status(400)
        .json({ message: "You have already reported this review" });

    review.reports.push({ user: req.user._id, title, details: details || "" });
    await review.save();

    notifyAdmins({
      type: "review_reported",
      title: "Review Reported",
      message: `"${review.product?.name}" review flagged: ${title}`,
      link: `/admin/reviews?tab=reported&id=${review._id}`,
    });
    res.json({ message: "Review reported successfully" });
  } catch (err) {
    console.error("reportReview:", err);
    res
      .status(500)
      .json({ message: "Failed to report review", error: err.message });
  }
};
exports.getReviewStats = async (req, res) => {
  try {
    const [total, reportedCount, avgResult] = await Promise.all([
      Review.countDocuments({}),
      Review.countDocuments({ "reports.0": { $exists: true } }),
      Review.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
    ]);

    const averageRating = avgResult[0]
      ? Math.round(avgResult[0].avg * 10) / 10
      : 0;

    res.json({ total, reportedCount, averageRating });
  } catch (err) {
    console.error("getReviewStats:", err);
    res
      .status(500)
      .json({ message: "Failed to load review stats", error: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      rating,
      ratingMin,
      product: productId,
      search,
      dateFrom,
      dateTo,
      sort = "newest",
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const baseFilter = {};
    if (status && status !== "all") baseFilter.status = status;
    if (rating) baseFilter.rating = Number(rating);
    else if (ratingMin) baseFilter.rating = { $gte: Number(ratingMin) };
    if (productId && mongoose.Types.ObjectId.isValid(productId))
      baseFilter.product = new mongoose.Types.ObjectId(productId);
    if (dateFrom || dateTo) {
      baseFilter.createdAt = {};
      if (dateFrom) baseFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        baseFilter.createdAt.$lte = end;
      }
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { rating: -1, createdAt: -1 },
      lowest: { rating: 1, createdAt: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.newest;

    let reviews, total;

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      const basePipeline = [
        { $match: baseFilter },
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "product",
            pipeline: [
              { $project: { name: 1, slug: 1, images: 1, colors: 1 } },
            ], 
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { reviewText: regex },
              { "user.name": regex },
              { "user.email": regex },
            ],
          },
        },
      ];
      const [countResult, docs] = await Promise.all([
        Review.aggregate([...basePipeline, { $count: "total" }]),
        Review.aggregate([
          ...basePipeline,
          { $sort: sortObj },
          { $skip: skip },
          { $limit: limitNum },
          {
            $lookup: {
              from: "products",
              localField: "product",
              foreignField: "_id",
              as: "product",
              pipeline: [{ $project: { name: 1, slug: 1, images: 1 } }],
            },
          },
          { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "users",
              localField: "moderatedBy",
              foreignField: "_id",
              as: "moderatedBy",
              pipeline: [{ $project: { name: 1 } }],
            },
          },
          {
            $unwind: { path: "$moderatedBy", preserveNullAndEmptyArrays: true },
          },
        ]),
      ]);
      total = countResult[0]?.total || 0;
      reviews = docs;
    } else {
      const [docs, count] = await Promise.all([
        Review.find(baseFilter)
          .populate("product", "name slug images colors")
          .populate("user", "name email profilePicture")
          .populate("moderatedBy", "name")
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Review.countDocuments(baseFilter),
      ]);
      reviews = docs;
      total = count;
    }

    res.json({
      reviews,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (err) {
    console.error("getReviews:", err);
    res
      .status(500)
      .json({ message: "Failed to load reviews", error: err.message });
  }
};
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("product", "name slug images colors")
      .populate("user", "name email profilePicture")
      .populate("reports.user", "name email")
      .populate("moderatedBy", "name")
      .lean();
    if (!review) return res.status(404).json({ message: "Review not found" });
    review.reportCount = review.reports?.length || 0;
    res.json({ review });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load review", error: err.message });
  }
};

exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    const wasApproved = review.status === "approved";
    review.status = "approved";
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();
    await review.save();
    if (!wasApproved) await recomputeProductRating(review.product);
    await review.populate([
      { path: "product", select: "name slug images" },
      { path: "user", select: "name email avatar" },
      { path: "moderatedBy", select: "name" },
    ]);
    res.json({ message: "Review approved", review });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to approve review", error: err.message });
  }
};

exports.rejectReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    const wasApproved = review.status === "approved";
    review.status = "rejected";
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();
    await review.save();
    if (wasApproved) await recomputeProductRating(review.product);
    await review.populate([
      { path: "product", select: "name slug images" },
      { path: "user", select: "name email avatar" },
      { path: "moderatedBy", select: "name" },
    ]);
    res.json({ message: "Review rejected", review });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to reject review", error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate(
      "product",
      "name",
    );
    if (!review) return res.status(404).json({ message: "Review not found" });

    const wasApproved = review.status === "approved";
    const productId = review.product._id;
    const productName = review.product.name;
    const reviewUserId = review.user;
    await Review.findByIdAndDelete(req.params.id);
    if (wasApproved) await recomputeProductRating(productId);
    await notifyUser(reviewUserId, {
      type: "review_deleted",
      title: "Review removed",
      message: `Your review for "${productName}" was deleted by the admin because you broke some rules.`,
      link: `/product/${productId}`,
      meta: { productId, reviewId: req.params.id },
    });
    res.json({ message: "Review deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete review", error: err.message });
  }
};

exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ message: "No review IDs provided" });
    if (!["approve", "reject", "delete"].includes(action))
      return res.status(400).json({ message: `Invalid action: ${action}` });

    if (action === "delete") {
      const docs = await Review.find({ _id: { $in: ids } })
        .populate("product", "name images")
        .lean();

      const affectedProductIds = [
        ...new Set(docs.map((r) => r.product?._id?.toString()).filter(Boolean)),
      ];

      await Review.deleteMany({ _id: { $in: ids } });
      await Promise.all(affectedProductIds.map(recomputeProductRating));

      const { notifyUser } = require("../utils/notify");
      await Promise.all(
        docs.map((r) => {
          if (!r.product) return null;
          const productImage =
            r.product.images?.[0]?.url || r.product.images?.[0] || null;
          return notifyUser(r.user, {
            type: "review_deleted",
            title: "Review removed",
            message: `Your review for "${r.product.name}" was deleted by the admin because you broke some rules.`,
            link: `/products/${r.product._id}`,
            image: productImage,
            meta: { productId: r.product._id, reviewId: r._id },
          });
        }),
      );

      return res.json({
        message: "Bulk delete successful",
        affectedCount: ids.length,
      });
    }

    const existing = await Review.find({ _id: { $in: ids } }).select(
      "product status",
    );
    const affectedProductIds = [
      ...new Set(existing.map((r) => r.product.toString())),
    ];

    await Review.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          status: action === "approve" ? "approved" : "rejected",
          moderatedBy: req.user._id,
          moderatedAt: new Date(),
        },
      },
    );
    await Promise.all(affectedProductIds.map(recomputeProductRating));
    res.json({
      message: `Bulk ${action} successful`,
      affectedCount: ids.length,
    });
  } catch (err) {
    console.error("bulkUpdateStatus:", err);
    res.status(500).json({ message: "Bulk action failed", error: err.message });
  }
};

exports.getReportedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ "reports.0": { $exists: true } })
      .populate("product", "name slug images colors")
      .populate("user", "name email profilePicture")
      .populate("reports.user", "name email")
      .sort({ updatedAt: -1 })
      .lean();
    const withCount = reviews
      .map((r) => ({ ...r, reportCount: r.reports.length }))
      .sort((a, b) => b.reportCount - a.reportCount);

    res.json({ reviews: withCount, total: withCount.length });
  } catch (err) {
    console.error("getReportedReviews:", err);
    res
      .status(500)
      .json({ message: "Failed to load reported reviews", error: err.message });
  }
};
