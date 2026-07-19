const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

async function getUserIdFromCookie(req) {
  try {
    const token = req.cookies?.token;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id || null;
  } catch {
    return null;
  }
}

const FALLBACK_LIMIT = 10;

exports.getRecommendations = async (req, res) => {
  try {
    const userId = await getUserIdFromCookie(req);

    if (!userId) {
      const fallback = await Product.find({
        $or: [{ featured: true }, { popular: true }],
      })
        .populate("category", "name")
        .limit(FALLBACK_LIMIT)
        .lean();
      return res.json({ products: fallback, personalized: false });
    }

    const user = await User.findById(userId).select("cart wishlist").lean();
    const orders = await Order.find({ user: userId })
      .select("orderItems.product")
      .lean();

    const seenProductIds = new Set();
    (user?.cart || []).forEach(
      (c) => c.product && seenProductIds.add(c.product.toString()),
    );
    (user?.wishlist || []).forEach((id) => seenProductIds.add(id.toString()));
    orders.forEach((o) =>
      o.orderItems.forEach(
        (item) => item.product && seenProductIds.add(item.product.toString()),
      ),
    );

    if (seenProductIds.size === 0) {
      const fallback = await Product.find({
        $or: [{ featured: true }, { popular: true }],
      })
        .populate("category", "name")
        .limit(FALLBACK_LIMIT)
        .lean();
      return res.json({ products: fallback, personalized: false });
    }

    const seenObjectIds = [...seenProductIds].map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    const topCategories = await Product.aggregate([
      { $match: { _id: { $in: seenObjectIds } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    if (topCategories.length === 0) {
      const fallback = await Product.find({
        $or: [{ featured: true }, { popular: true }],
      })
        .populate("category", "name")
        .limit(FALLBACK_LIMIT)
        .lean();
      return res.json({ products: fallback, personalized: false });
    }

    const categoryIds = topCategories.map((c) => c.category);

    const recommendations = await Product.find({
      category: { $in: categoryIds },
      _id: { $nin: seenObjectIds },
    })
      .populate("category", "name")
      .sort({ averageRating: -1, popular: -1, createdAt: -1 })
      .limit(FALLBACK_LIMIT)
      .lean();

    if (recommendations.length < FALLBACK_LIMIT) {
      const excludeIds = [
        ...seenObjectIds,
        ...recommendations.map((p) => p._id),
      ];
      const topUp = await Product.find({
        _id: { $nin: excludeIds },
        $or: [{ featured: true }, { popular: true }],
      })
        .populate("category", "name")
        .limit(FALLBACK_LIMIT - recommendations.length)
        .lean();
      recommendations.push(...topUp);
    }

    res.json({ products: recommendations, personalized: true });
  } catch (err) {
    console.error("getRecommendations:", err);
    res
      .status(500)
      .json({ message: "Failed to load recommendations", products: [] });
  }
};
