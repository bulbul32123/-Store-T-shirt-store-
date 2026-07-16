const User = require("../models/User");
const Order = require("../models/Order");

const HIGH_SPENDER_THRESHOLD = 20000;
const REPEAT_BUYER_MIN_ORDERS = 2;
const INACTIVE_DAYS = 90;

exports.recalculateUserSegment = async (userId) => {
  try {
    const agg = await Order.aggregate([
      { $match: { user: userId, paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
          lastOrder: { $max: "$createdAt" },
        },
      },
    ]);

    const stats = agg[0] || { totalSpent: 0, orderCount: 0, lastOrder: null };
    let segment = "regular";

    if (stats.totalSpent >= HIGH_SPENDER_THRESHOLD) {
      segment = "high_spender";
    } else if (stats.orderCount >= REPEAT_BUYER_MIN_ORDERS) {
      segment = "repeat_buyer";
    } else if (stats.lastOrder) {
      const daysSince =
        (Date.now() - new Date(stats.lastOrder)) / (1000 * 60 * 60 * 24);
      if (daysSince >= INACTIVE_DAYS) segment = "inactive";
    }

    await User.findByIdAndUpdate(userId, {
      segment,
      lastOrderDate: stats.lastOrder || undefined,
    });

    return segment;
  } catch (err) {
    console.error("recalculateUserSegment error:", err);
    return null;
  }
};

exports.recalculateAllSegments = async () => {
  const users = await User.find({ role: "user" }).select("_id").lean();
  let updated = 0;
  for (const u of users) {
    const result = await exports.recalculateUserSegment(u._id);
    if (result) updated++;
  }
  return { total: users.length, updated };
};
