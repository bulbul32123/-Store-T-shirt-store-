//reportContoller
const User = require("../models/User");
const { recalculateAllSegments } = require("../utils/segmentUser");
const Order = require("../models/Order");

function getDateRange(range) {
  const end = new Date();
  const start = new Date();
  switch (range) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
    case "1y":
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setDate(end.getDate() - 30);
  }
  return { start, end };
}

function fillRange(start, end, groupByDay, dataMap, keys) {
  const result = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = groupByDay
      ? `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`
      : `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const existing = dataMap.get(key);
    const row = { date: key };
    keys.forEach((k) => (row[k] = existing?.[k] || 0));
    result.push(row);
    if (groupByDay) cursor.setDate(cursor.getDate() + 1);
    else cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
}

exports.getReportOverview = async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const { start, end } = getDateRange(range);
    const prevStart = new Date(start.getTime() - (end - start));

    const [
      totalCustomers,
      newCustomers,
      prevNewCustomers,
      returningCustomers,
      revenueAgg,
      prevRevenueAgg,
      orderCountAgg,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({
        role: "user",
        createdAt: { $gte: start, $lte: end },
      }),
      User.countDocuments({
        role: "user",
        createdAt: { $gte: prevStart, $lt: start },
      }),
      User.countDocuments({
        role: "user",
        lastOrderDate: { $gte: start, $lte: end },
        createdAt: { $lt: start },
      }),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: prevStart, $lt: start },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Order.countDocuments({
        paymentStatus: "paid",
        createdAt: { $gte: start, $lte: end },
      }),
    ]);

    const revenue = revenueAgg[0]?.total || 0;
    const prevRevenue = prevRevenueAgg[0]?.total || 0;
    const avgOrderValue =
      orderCountAgg > 0 ? +(revenue / orderCountAgg).toFixed(2) : 0;

    const pctChange = (curr, prev) =>
      prev === 0
        ? curr > 0
          ? 100
          : 0
        : +(((curr - prev) / prev) * 100).toFixed(1);

    const activeBefore = await User.countDocuments({
      role: "user",
      createdAt: { $lt: start },
    });
    const retentionRate =
      activeBefore > 0
        ? +((returningCustomers / activeBefore) * 100).toFixed(1)
        : 0;

    res.json({
      totalCustomers,
      newCustomers,
      newCustomersChange: pctChange(newCustomers, prevNewCustomers),
      returningCustomers,
      retentionRate,
      revenue,
      revenueChange: pctChange(revenue, prevRevenue),
      avgOrderValue,
      totalOrders: orderCountAgg,
    });
  } catch (err) {
    console.error("getReportOverview:", err);
    res.status(500).json({ message: "Failed to load report overview" });
  }
};

exports.getAcquisitionTrend = async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const { start, end } = getDateRange(range);
    const groupByDay = range === "7d" || range === "30d";

    const trend = await User.aggregate([
      { $match: { role: "user", createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: groupByDay
            ? {
                y: { $year: "$createdAt" },
                m: { $month: "$createdAt" },
                d: { $dayOfMonth: "$createdAt" },
              }
            : { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]);
    const dataMap = new Map(
      trend.map((t) => [
        groupByDay
          ? `${t._id.y}-${String(t._id.m).padStart(2, "0")}-${String(t._id.d).padStart(2, "0")}`
          : `${t._id.y}-${String(t._id.m).padStart(2, "0")}`,
        { newCustomers: t.count },
      ]),
    );
    const formatted = fillRange(start, end, groupByDay, dataMap, [
      "newCustomers",
    ]);

    res.json({ trend: formatted });
  } catch (err) {
    console.error("getAcquisitionTrend:", err);
    res.status(500).json({ message: "Failed to load acquisition trend" });
  }
};

exports.getRetentionTrend = async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const { start, end } = getDateRange(range);
    const groupByDay = range === "7d" || range === "30d";

    const orders = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: start, $lte: end },
        },
      },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: groupByDay
            ? {
                y: { $year: "$createdAt" },
                m: { $month: "$createdAt" },
                d: { $dayOfMonth: "$createdAt" },
              }
            : { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          orders: { $push: { user: "$user" } },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]);

    const seenUsers = new Set();
    const dataMap = new Map();
    for (const bucket of orders) {
      const key = groupByDay
        ? `${bucket._id.y}-${String(bucket._id.m).padStart(2, "0")}-${String(bucket._id.d).padStart(2, "0")}`
        : `${bucket._id.y}-${String(bucket._id.m).padStart(2, "0")}`;
      const usersThisBucket = new Set(
        bucket.orders.map((o) => o.user.toString()),
      );
      let newCount = 0,
        returningCount = 0;
      for (const uid of usersThisBucket) {
        if (seenUsers.has(uid)) returningCount++;
        else newCount++;
        seenUsers.add(uid);
      }
      dataMap.set(key, {
        newCustomers: newCount,
        returningCustomers: returningCount,
      });
    }

    const formatted = fillRange(start, end, groupByDay, dataMap, [
      "newCustomers",
      "returningCustomers",
    ]);
    res.json({ trend: formatted });
  } catch (err) {
    console.error("getRetentionTrend:", err);
    res.status(500).json({ message: "Failed to load retention trend" });
  }
};
exports.getCustomerSegments = async (req, res) => {
  try {
    await recalculateAllSegments();
    const segments = await User.aggregate([
      { $match: { role: "user" } },
      { $group: { _id: "$segment", count: { $sum: 1 } } },
    ]);
    const formatted = segments.map((s) => ({
      segment: s._id || "regular",
      count: s.count,
    }));
    res.json({ segments: formatted });
  } catch (err) {
    console.error("getCustomerSegments:", err);
    res.status(500).json({ message: "Failed to load segments" });
  }
};

exports.getRevenueTrend = async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const { start, end } = getDateRange(range);
    const groupByDay = range === "7d" || range === "30d";

    const trend = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: groupByDay
            ? {
                y: { $year: "$createdAt" },
                m: { $month: "$createdAt" },
                d: { $dayOfMonth: "$createdAt" },
              }
            : { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]);

    const dataMap = new Map(
      trend.map((t) => [
        groupByDay
          ? `${t._id.y}-${String(t._id.m).padStart(2, "0")}-${String(t._id.d).padStart(2, "0")}`
          : `${t._id.y}-${String(t._id.m).padStart(2, "0")}`,
        { revenue: t.revenue, orders: t.orders },
      ]),
    );
    const formatted = fillRange(start, end, groupByDay, dataMap, [
      "revenue",
      "orders",
    ]);

    res.json({ trend: formatted });
  } catch (err) {
    console.error("getRevenueTrend:", err);
    res.status(500).json({ message: "Failed to load revenue trend" });
  }
};

exports.getTopProductsReport = async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const { start, end } = getDateRange(range);

    const topProducts = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: start, $lte: end },
        },
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          image: { $first: "$orderItems.image" },
          unitsSold: { $sum: "$orderItems.quantity" },
          revenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]);

    res.json({ products: topProducts });
  } catch (err) {
    console.error("getTopProductsReport:", err);
    res.status(500).json({ message: "Failed to load top products" });
  }
};
