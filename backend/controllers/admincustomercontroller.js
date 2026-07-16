const mongoose = require("mongoose");
const User = require("../models/User");
const { notifyUser } = require("../utils/notify");

const ORDER_USER_FIELD = "user";
const ORDER_AMOUNT_FIELD = "totalPrice";
let Order = null;
try {
  Order = require("../models/Order");
} catch (_) {
  console.warn(
    "[CustomerCtrl] Order model not found — order stats will show 0s",
  );
}

async function enrichWithOrderStats(customers) {
  if (!Order || !customers.length) {
    return customers.map((c) => ({
      ...c,
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: null,
    }));
  }

  const ids = customers.map((c) => c._id);
  const stats = await Order.aggregate([
    { $match: { [ORDER_USER_FIELD]: { $in: ids } } },
    {
      $group: {
        _id: `$${ORDER_USER_FIELD}`,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: `$${ORDER_AMOUNT_FIELD}` },
        lastOrderDate: { $max: "$createdAt" },
      },
    },
  ]);

  const map = {};
  stats.forEach((s) => {
    map[s._id.toString()] = s;
  });

  return customers.map((c) => ({
    ...c,
    totalOrders: map[c._id.toString()]?.totalOrders ?? 0,
    totalSpent: map[c._id.toString()]?.totalSpent ?? 0,
    lastOrderDate: map[c._id.toString()]?.lastOrderDate ?? null,
  }));
}

exports.getCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      segment = "all",
      status,
      sort = "createdAt_desc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { role: "user" };

    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { phoneNumber: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (status && status !== "all") filter.status = status;
    if (segment && segment !== "all") filter.segment = segment;

    const needsOrderSort = ["totalSpent_desc", "totalOrders_desc"].includes(
      sort,
    );

    let customers = [],
      total = 0;

    if (needsOrderSort && Order) {
      const sortField =
        sort === "totalSpent_desc" ? "totalSpent" : "totalOrders";

      const [countRes, rows] = await Promise.all([
        User.aggregate([{ $match: filter }, { $count: "n" }]),
        User.aggregate([
          { $match: filter },
          {
            $lookup: {
              from: "orders",
              localField: "_id",
              foreignField: ORDER_USER_FIELD,
              as: "_orders",
            },
          },
          {
            $addFields: {
              totalOrders: { $size: "$_orders" },
              totalSpent: { $sum: `$_orders.${ORDER_AMOUNT_FIELD}` },
              lastOrderDate: { $max: "$_orders.createdAt" },
            },
          },
          { $sort: { [sortField]: -1 } },
          { $skip: skip },
          { $limit: limitNum },
          { $project: { password: 0, _orders: 0 } },
        ]),
      ]);

      total = countRes[0]?.n ?? 0;
      customers = rows;
    } else {
      const sortMap = {
        createdAt_desc: { createdAt: -1 },
        createdAt_asc: { createdAt: 1 },
        name_asc: { name: 1 },
      };
      const sortObj = sortMap[sort] || { createdAt: -1 };

      [customers, total] = await Promise.all([
        User.find(filter)
          .select("-password")
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        User.countDocuments(filter),
      ]);

      customers = await enrichWithOrderStats(customers);
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalCustomers, newThisMonth] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", createdAt: { $gte: monthStart } }),
    ]);

    let activeCustomers = 0,
      averageOrderValue = 0;

    if (Order) {
      const [activeIds, revAgg] = await Promise.all([
        Order.distinct(ORDER_USER_FIELD, {
          createdAt: { $gte: thirtyDaysAgo },
        }),
        Order.aggregate([
          {
            $group: {
              _id: null,
              rev: { $sum: `$${ORDER_AMOUNT_FIELD}` },
              cnt: { $sum: 1 },
            },
          },
        ]),
      ]);
      activeCustomers = activeIds.length;
      const rv = revAgg[0] || { rev: 0, cnt: 0 };
      averageOrderValue =
        rv.cnt > 0 ? Math.round((rv.rev / rv.cnt) * 100) / 100 : 0;
    }

    return res.json({
      success: true,
      data: {
        customers,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.max(1, Math.ceil(total / limitNum)),
          totalItems: total,
          itemsPerPage: limitNum,
        },
        metrics: {
          totalCustomers,
          activeCustomers,
          averageOrderValue,
          newThisMonth,
        },
      },
    });
  } catch (err) {
    console.error("[getCustomers]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: "user" })
      .select("-password")
      .lean();

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    let orders = [],
      stats = { totalOrders: 0, totalSpent: 0, aov: 0 };

    if (Order) {
      const uid = new mongoose.Types.ObjectId(req.params.id);
      const [recentOrders, agg] = await Promise.all([
        Order.find({ [ORDER_USER_FIELD]: uid })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        Order.aggregate([
          { $match: { [ORDER_USER_FIELD]: uid } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: `$${ORDER_AMOUNT_FIELD}` },
            },
          },
        ]),
      ]);

      orders = recentOrders;
      const a = agg[0] || { totalOrders: 0, totalSpent: 0 };
      stats = {
        totalOrders: a.totalOrders,
        totalSpent: a.totalSpent,
        aov:
          a.totalOrders > 0
            ? Math.round((a.totalSpent / a.totalOrders) * 100) / 100
            : 0,
      };
    }

    return res.json({ success: true, data: { customer, orders, stats } });
  } catch (err) {
    console.error("[getCustomerById]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { status, note, name, phoneNumber, location, segment } = req.body;

    const $set = {};
    const $push = {};

    if (status !== undefined) $set.status = status;
    if (name !== undefined) $set.name = name;
    if (phoneNumber !== undefined) $set.phoneNumber = phoneNumber;
    if (location !== undefined) $set.location = location;
    if (segment !== undefined) $set.segment = segment;

    if (note?.trim()) {
      $push.notes = {
        text: note.trim(),
        addedBy: req.user?.name || "Admin",
        createdAt: new Date(),
      };
    }

    const updateOp = {};
    if (Object.keys($set).length) updateOp.$set = $set;
    if (Object.keys($push).length) updateOp.$push = $push;

    if (!Object.keys(updateOp).length) {
      return res
        .status(400)
        .json({ success: false, message: "No update fields provided" });
    }

    const existing = await User.findOne({
      _id: req.params.id,
      role: "user",
    }).select("status");
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: "user" },
      updateOp,
      { new: true, runValidators: true, select: "-password" },
    );

    if (status && status === "suspended" && existing.status !== "suspended") {
      await notifyUser(customer._id, {
        type: "account_suspended",
        title: "Account Suspended",
        message:
          "Your account has been suspended for violating Payra's Terms and Conditions. Please contact Customer Support for help.",
        link: "/?chatbox",
      });
    }
    if (status && status === "active" && existing.status === "suspended") {
      await notifyUser(customer._id, {
        type: "account_reactivated",
        title: "Account Reactivated",
        message:
          "Your account has been reactivated. You can now place orders again.",
        link: "/profile/account",
      });
    }

    return res.json({ success: true, data: customer });
  } catch (err) {
    console.error("[updateCustomer]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
