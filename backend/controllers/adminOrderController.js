const mongoose = require('mongoose');
const Order = require('../models/Order');
const { notifyUser } = require('../utils/notify');

const FULFILLMENT_STATUSES = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_MESSAGES = {
    pending: 'Your order is pending confirmation.',
    processing: 'Your order is now being processed.',
    confirmed: 'Your order has been confirmed.',
    shipped: 'Your order has shipped!',
    delivered: 'Your order has been delivered.',
    cancelled: 'Your order has been cancelled.',
};

function buildMatchStage(query) {
    const match = {};
      if (query.archived === "true") {
        match.isArchived = true;
      } else {
        match.isArchived = { $ne: true };
      }

      if (
        query.status &&
        query.status !== "all" &&
        FULFILLMENT_STATUSES.includes(query.status)
      ) {
        match.orderStatus = query.status;
      }
    if (query.status && query.status !== 'all' && FULFILLMENT_STATUSES.includes(query.status)) {
        match.orderStatus = query.status;
    }

    if (query.paymentStatus && query.paymentStatus !== 'all') {
        match.paymentStatus = query.paymentStatus;
    }
    if (query.startDate || query.endDate) {
        match.createdAt = {};
        if (query.startDate) match.createdAt.$gte = new Date(query.startDate);
        if (query.endDate) {
            const end = new Date(query.endDate);
            end.setHours(23, 59, 59, 999);
            match.createdAt.$lte = end;
        }
    }

    if (query.search && query.search.trim()) {
        const term = query.search.trim();
        const orConditions = [
            { 'customer.name': { $regex: term, $options: 'i' } },
            { 'customer.email': { $regex: term, $options: 'i' } }
        ];

        const numericMatch = term.match(/\d+/);
        if (numericMatch) {
            orConditions.push({ orderNumber: Number(numericMatch[0]) });
        }

        if (mongoose.Types.ObjectId.isValid(term)) {
            orConditions.push({ _id: new mongoose.Types.ObjectId(term) });
        }

        match.$or = orConditions;
    }

    return match;
}
exports.getOrders = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const sortBy = ['createdAt', 'totalPrice', 'orderNumber'].includes(req.query.sortBy)
            ? req.query.sortBy
            : 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const basePipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } }
        ];

        const match = buildMatchStage(req.query);

        const pipeline = [
          ...basePipeline,
          { $match: match },
          {
            $facet: {
              data: [
                { $sort: { [sortBy]: sortOrder } },
                { $skip: skip },
                { $limit: limit },
                {
                  $project: {
                    orderNumber: 1,
                    createdAt: 1,
                    totalPrice: 1,
                    paymentStatus: 1,
                    isArchived: 1,
                    orderStatus: 1,
                    trackingNumber: 1,
                    "customer.name": 1,
                    "customer.email": 1,
                  },
                },
              ],
              totalCount: [{ $count: "count" }],
            },
          },
        ];

        const result = await Order.aggregate(pipeline);
        const data = result[0]?.data || [];
        const totalOrders = result[0]?.totalCount?.[0]?.count || 0;
        const summaryAgg = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrdersCount: { $sum: 1 },
                    pendingFulfillment: {
                        $sum: {
                            $cond: [{ $in: ['$orderStatus', ['pending', 'processing']] }, 1, 0]
                        }
                    },
                    totalRevenue: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalPrice', 0]
                        }
                    },
                    refundedOrCancelled: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ['$orderStatus', 'cancelled'] },
                                        { $eq: ['$paymentStatus', 'refunded'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const summary = summaryAgg[0] || {
            totalOrdersCount: 0,
            pendingFulfillment: 0,
            totalRevenue: 0,
            refundedOrCancelled: 0
        };

        res.json({
          orders: data.map((o) => ({
            id: o._id,
            orderNumber: o.orderNumber,
            displayId: `#ORD-${o.orderNumber}`,
            createdAt: o.createdAt,
            totalPrice: o.totalPrice,
            paymentStatus: o.paymentStatus,
            isArchived: o.isArchived || false,
            orderStatus: o.orderStatus,
            trackingNumber: o.trackingNumber || null,
            customer: {
              name: o.customer?.name || "Deleted customer",
              email: o.customer?.email || "—",
            },
          })),
          pagination: {
            currentPage: page,
            totalPages: Math.max(Math.ceil(totalOrders / limit), 1),
            totalOrders,
            limit,
          },
          summary: {
            totalOrders: summary.totalOrdersCount,
            pendingFulfillment: summary.pendingFulfillment,
            totalRevenue: summary.totalRevenue,
            refundedOrCancelled: summary.refundedOrCancelled,
          },
        });
    } catch (err) {
        console.error('getOrders error:', err);
        res.status(500).json({ message: 'Failed to load orders', error: err.message });
    }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone avatar profilePicture")
      .populate("orderItems.product", "name images sku")
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found" });

    const customerOrderCount = order.user
      ? await Order.countDocuments({ user: order.user._id })
      : 0;

    res.json({
      ...order,
      displayId: `#ORD-${order.orderNumber}`,
      customerOrderCount,
    });
  } catch (err) {
    console.error("getOrderById error:", err);
    res
      .status(500)
      .json({ message: "Failed to load order", error: err.message });
  }
};

exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { orderIds, orderStatus } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res
        .status(400)
        .json({ message: "orderIds must be a non-empty array" });
    }
    if (!FULFILLMENT_STATUSES.includes(orderStatus)) {
      return res
        .status(400)
        .json({
          message: `orderStatus must be one of: ${FULFILLMENT_STATUSES.join(", ")}`,
        });
    }

    const update = { orderStatus, updatedAt: new Date() };
    if (orderStatus === "delivered")
      ((update.isDelivered = true), (update.deliveredAt = new Date()));

    const result = await Order.updateMany(
      { _id: { $in: orderIds }, orderStatus: { $ne: "cancelled" } },
      { $set: update },
    );

    const affectedOrders = await Order.find({
      _id: { $in: orderIds },
      orderStatus: orderStatus,
    }).select("user orderNumber _id");

    for (const o of affectedOrders) {
      await notifyUser(o.user, {
        type: "order_update",
        title: `Order ${orderStatus}`,
        message: `Order #${o.orderNumber}: ${STATUS_MESSAGES[orderStatus]}`,
        link: `/profile/orders/${o._id}`,
      });
    }

    const skippedCancelled = orderIds.length - result.matchedCount;
    res.json({
      message: `${result.modifiedCount} order(s) updated to "${orderStatus}"${skippedCancelled > 0 ? ` (${skippedCancelled} cancelled order(s) skipped)` : ""}`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("bulkUpdateStatus error:", err);
    res.status(500).json({ message: "Bulk update failed", error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const allowedFields = [
      "orderStatus",
      "paymentStatus",
      "internalNotes",
      "trackingNumber",
      "isArchived",
    ]; 
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (
      updates.orderStatus &&
      !FULFILLMENT_STATUSES.includes(updates.orderStatus)
    ) {
      return res.status(400).json({ message: "Invalid orderStatus" });
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided" });
    }

    const existing = await Order.findById(req.params.id).select("orderStatus");
    if (!existing) return res.status(404).json({ message: "Order not found" });

    if (
      existing.orderStatus === "cancelled" &&
      updates.orderStatus &&
      updates.orderStatus !== "cancelled"
    ) {
      return res
        .status(400)
        .json({ message: "Cannot change the status of a cancelled order" });
    }

    if (updates.orderStatus === "delivered") {
      updates.isDelivered = true;
      updates.deliveredAt = new Date();
    }

    if (updates.isArchived === true) {
      updates.archivedAt = new Date();
    } else if (updates.isArchived === false) {
      updates.archivedAt = null;
    }

    const statusHistoryPush =
      updates.orderStatus && updates.orderStatus !== existing.orderStatus
        ? {
            status: updates.orderStatus,
            note: req.body.statusNote || "",
            changedAt: new Date(),
          }
        : null;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: updates,
        ...(statusHistoryPush
          ? { $push: { statusHistory: statusHistoryPush } }
          : {}),
      },
      { new: true, runValidators: true },
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (updates.orderStatus) {
      await notifyUser(order.user, {
        type: "order_update",
        title: `Order ${updates.orderStatus}`,
        message: `Order #${order.orderNumber}: ${STATUS_MESSAGES[updates.orderStatus]}`,
        link: `/profile/orders/${order._id}`,
      });
    }

    res.json({ message: "Order updated", order });
  } catch (err) {
    console.error("updateOrder error:", err);
    res
      .status(500)
      .json({ message: "Failed to update order", error: err.message });
  }
};