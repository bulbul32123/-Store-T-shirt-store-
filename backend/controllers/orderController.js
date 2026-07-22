const Order = require("../models/Order");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Product = require("../models/Product");
const { createRewardCoupon } = require("./couponcontroller");
const { notifyUser } = require("../utils/notify");
const { notifyAdmins } = require("../utils/notify");
const { recalculateUserSegment } = require("../utils/segmentUser");
const PendingOrder = require("../models/PendingOrder");
const stripe = require("../utils/stripeClient");

const FREE_SHIPPING_THRESHOLD = 100;
const STANDARD_SHIPPING_FEE = 10;
const FLAT_TAX_FEE = 5;

exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderItems, shippingAddress, phone, couponCode, orderNotes } =
      req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    const enrichedItems = [];
    let itemsPrice = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${product.name}` });
      }

      const price = computeFinalPrice(product);
      itemsPrice += price * item.quantity;

      enrichedItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price,
        size: item.size,
        color: item.color,
        image: item.image || product.images?.[0]?.url,
        customization: item.customization,
      });
    }

    itemsPrice = +itemsPrice.toFixed(2);
    const shippingPrice =
      itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const taxPrice = FLAT_TAX_FEE;

    let discountAmount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const normalizedCode = couponCode.trim().toUpperCase();
      const couponDoc = await Coupon.findOne({ code: normalizedCode });

      if (!couponDoc || !couponDoc.isActive) {
        return res.status(400).json({ message: "Invalid or inactive coupon" });
      }
      if (
        couponDoc.exclusiveToUser &&
        couponDoc.exclusiveToUser.toString() !== req.user.id
      ) {
        return res
          .status(403)
          .json({ message: "This coupon is not valid for your account" });
      }
      const now = new Date();
      if (
        couponDoc.expiryDate < now ||
        (couponDoc.startDate && couponDoc.startDate > now)
      ) {
        return res
          .status(400)
          .json({ message: "Coupon is not currently valid" });
      }
      if (
        couponDoc.usageLimit != null &&
        couponDoc.usedCount >= couponDoc.usageLimit
      ) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }
      if (itemsPrice < couponDoc.minPurchaseAmount) {
        return res.status(400).json({
          message: `Minimum purchase of $${couponDoc.minPurchaseAmount} required`,
        });
      }

      const user = await User.findById(req.user.id);
      if (couponDoc.perUserLimit != null) {
        const userUsageCount =
          user.usedCoupons?.filter((u) => u.code === normalizedCode).length ||
          0;
        if (userUsageCount >= couponDoc.perUserLimit) {
          return res.status(400).json({
            message:
              "You have already used this coupon the maximum number of times",
          });
        }
      }

      discountAmount =
        couponDoc.discountType === "percentage"
          ? (itemsPrice * couponDoc.discountValue) / 100
          : couponDoc.discountValue;

      if (
        couponDoc.discountType === "percentage" &&
        couponDoc.maxDiscountAmount != null
      ) {
        discountAmount = Math.min(discountAmount, couponDoc.maxDiscountAmount);
      }
      discountAmount = Math.min(+discountAmount.toFixed(2), itemsPrice);
      appliedCouponCode = normalizedCode;
    }

    const totalPrice = +Math.max(
      itemsPrice + shippingPrice + taxPrice - discountAmount,
      0,
    ).toFixed(2);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Order (${enrichedItems.length} item(s))` },
            unit_amount: Math.round(totalPrice * 100), 
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/checkout/success/session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
    });

    await PendingOrder.create({
      stripeSessionId: session.id,
      user: req.user.id,
      orderItems: enrichedItems,
      shippingAddress,
      phone,
      itemsPrice,
      discountAmount,
      couponCode: appliedCouponCode,
      shippingPrice,
      taxPrice,
      totalPrice,
      orderNotes,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Create checkout session error:", error);
    res.status(500).json({ message: "Failed to start checkout" });
  }
};
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object;

  try {
    const existingOrder = await Order.findOne({ stripeSessionId: session.id });
    if (existingOrder) {
      return res.status(200).json({ received: true });
    }

    const pending = await PendingOrder.findOne({ stripeSessionId: session.id });
    if (!pending) {
      console.error("No PendingOrder found for session:", session.id);
      return res.status(200).json({ received: true });
    }

    for (const item of pending.orderItems) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        await stripe.refunds.create({ payment_intent: session.payment_intent });
        await pending.deleteOne();
        console.error(
          `Stock unavailable for ${item.name}, refunded session ${session.id}`,
        );
        return res.status(200).json({ received: true });
      }
    }

    for (const item of pending.orderItems) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: pending.user,
      orderItems: pending.orderItems,
      shippingAddress: pending.shippingAddress,
      phone: pending.phone,
      paymentMethod: "card",
      itemsPrice: pending.itemsPrice,
      discountAmount: pending.discountAmount,
      couponCode: pending.couponCode,
      taxPrice: pending.taxPrice,
      shippingPrice: pending.shippingPrice,
      totalPrice: pending.totalPrice,
      orderNotes: pending.orderNotes,
      stripeSessionId: session.id,
      paymentStatus: "paid",
      isPaid: true,
      paidAt: new Date(),
      paymentResult: {
        id: session.payment_intent,
        status: "paid",
        update_time: new Date().toISOString(),
        email_address: session.customer_email,
      },
    });

    const user = await User.findById(pending.user);
    user.orders.push(order._id);
    user.cart = [];

    let couponDoc = null;
    if (pending.couponCode) {
      couponDoc = await Coupon.findOne({ code: pending.couponCode });
      if (couponDoc) {
        couponDoc.usedCount += 1;
        await couponDoc.save();
      }
      user.usedCoupons.push({
        coupon: couponDoc?._id,
        code: pending.couponCode,
      });
    }
    await user.save();
    recalculateUserSegment(pending.user);
    const { notifyUser } = require("../utils/notify");
    await notifyUser(pending.user, {
      type: "order_update",
      title: "Order placed so",
      message: `Your order #${order.orderNumber} has been placed successfully.`,
      link: `/profile/orders/${order._id}`,
    });

    let rewardCoupon = null;
    if (order.totalPrice > 200) {
      try {
        rewardCoupon = await createRewardCoupon(pending.user);
        await notifyUser(pending.user, {
          title: "You earned a reward! 🎉",
          message: `Thanks for your order! Use code ${rewardCoupon.code} for 10% off your next order.`,
          type: "coupon",
          link: "/profile/orders",
        });
      } catch (rewardErr) {
        console.error("Reward generation error:", rewardErr);
      }
    }

    await pending.deleteOne();

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ message: "Webhook handler failed" });
  }
};
exports.getOrderBySession = async (req, res) => {
  try {
    const order = await Order.findOne({
      stripeSessionId: req.params.sessionId,
      user: req.user.id,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not ready yet" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

function computeFinalPrice(product) {
  const discount = Number(product.discount || 0);
  return discount > 0
    ? +(product.price - (product.price * discount) / 100).toFixed(2)
    : product.price;
}

exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      billingAddress,
      phone,
      paymentMethod,
      couponCode,
      orderNotes,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }
    if (!shippingAddress || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "Shipping address and payment method are required" });
    }

    const enrichedItems = [];
    let itemsPrice = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${product.name}` });
      }

      const price = computeFinalPrice(product);
      itemsPrice += price * item.quantity;

      enrichedItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price,
        size: item.size,
        color: item.color,
        image: item.image || product.images?.[0]?.url,
        customization: item.customization,
      });

      product.stock -= item.quantity; 
      await product.save();
    }

    itemsPrice = +itemsPrice.toFixed(2);
    const shippingPrice =
      itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const taxPrice = FLAT_TAX_FEE;

    let discountAmount = 0;
    let appliedCouponCode = null;
    let couponDoc = null;

    if (couponCode) {
      const normalizedCode = couponCode.trim().toUpperCase();
      couponDoc = await Coupon.findOne({ code: normalizedCode });
      if (
        couponDoc.exclusiveToUser &&
        couponDoc.exclusiveToUser.toString() !== req.user.id
      ) {
        return res
          .status(403)
          .json({ message: "This coupon is not valid for your account" });
      }

      if (!couponDoc || !couponDoc.isActive) {
        return res.status(400).json({ message: "Invalid or inactive coupon" });
      }
      const now = new Date();
      if (
        couponDoc.expiryDate < now ||
        (couponDoc.startDate && couponDoc.startDate > now)
      ) {
        return res
          .status(400)
          .json({ message: "Coupon is not currently valid" });
      }
      if (
        couponDoc.usageLimit != null &&
        couponDoc.usedCount >= couponDoc.usageLimit
      ) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }
      if (itemsPrice < couponDoc.minPurchaseAmount) {
        return res.status(400).json({
          message: `Minimum purchase of $${couponDoc.minPurchaseAmount} required`,
        });
      }

      const user = await User.findById(req.user.id);
      if (couponDoc.perUserLimit != null) {
        const userUsageCount =
          user.usedCoupons?.filter((u) => u.code === normalizedCode).length ||
          0;
        if (userUsageCount >= couponDoc.perUserLimit) {
          return res.status(400).json({
            message:
              "You have already used this coupon the maximum number of times",
          });
        }
      }

      discountAmount =
        couponDoc.discountType === "percentage"
          ? (itemsPrice * couponDoc.discountValue) / 100
          : couponDoc.discountValue;

      if (
        couponDoc.discountType === "percentage" &&
        couponDoc.maxDiscountAmount != null
      ) {
        discountAmount = Math.min(discountAmount, couponDoc.maxDiscountAmount);
      }
      discountAmount = Math.min(+discountAmount.toFixed(2), itemsPrice);
      appliedCouponCode = normalizedCode;
    }

    const totalPrice = +Math.max(
      itemsPrice + shippingPrice + taxPrice - discountAmount,
      0,
    ).toFixed(2);

    const order = await Order.create({
      user: req.user.id,
      orderItems: enrichedItems,
      shippingAddress,
      billingAddress,
      phone,
      paymentMethod,
      itemsPrice,
      discountAmount,
      couponCode: appliedCouponCode,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderNotes,
    });

    const user = await User.findById(req.user.id);
    user.orders.push(order._id);
    user.cart = [];
    if (appliedCouponCode) {
      user.usedCoupons.push({ coupon: couponDoc._id, code: appliedCouponCode });
    }
    await user.save();
    if (couponDoc) {
      couponDoc.usedCount += 1;
      await couponDoc.save();
    }
    recalculateUserSegment(req.user.id); 
    let rewardCoupon = null;
    if (totalPrice > 200) {
      try {
        rewardCoupon = await createRewardCoupon(req.user.id);

        const { notifyUsers } = require("../utils/notify");
        await notifyUsers([req.user.id], {
          title: "You earned a reward! 🎉",
          message: `Thanks for your order! Use code ${rewardCoupon.code} for 10% off your next order.`,
          type: "reward",
          link: "/profile/orders",
        });
      } catch (rewardErr) {
        console.error("Reward generation error:", rewardErr);
      }
    }
    await notifyUser(req.user.id, {
      type: "order_update",
      title: "Order placed",
      message: `Your order #${order.orderNumber} has been placed successfully.`,
      link: `/profile/orders/${order._id}`,
    });
    notifyAdmins({
      type: "new_order",
      title: "New Order",
      message: `${user.name} placed an order — $${order.totalPrice}`,
      link: `/admin/orders/?highlight=${order._id}`,
    });
    res.status(201).json({ order, rewardCoupon });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate({ path: "orderItems.product", select: "name images" });

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const Review = require("../models/Review");
    const productIds = order.orderItems
      .map((item) => item.product?._id || item.product)
      .filter(Boolean);

    const existingReviews = await Review.find({
      user: order.user._id,
      product: { $in: productIds },
    })
      .select("product")
      .lean();

    const reviewedIds = new Set(
      existingReviews.map((r) => r.product.toString()),
    );

    const orderObj = order.toObject();
    orderObj.orderItems = orderObj.orderItems.map((item) => ({
      ...item,
      hasReviewed: reviewedIds.has(
        (item.product?._id || item.product)?.toString(),
      ),
    }));

    res.status(200).json(orderObj);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { status, sort, limit = 10, page = 1 } = req.query;
    const filter = {};

    if (status) {
      filter.orderStatus = status;
    }
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case "newest":
          sortOption = { createdAt: -1 };
          break;
        case "oldest":
          sortOption = { createdAt: 1 };
          break;
        case "total-high":
          sortOption = { totalPrice: -1 };
          break;
        case "total-low":
          sortOption = { totalPrice: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    } else {
      sortOption = { createdAt: -1 };
    }
    const pageSize = parseInt(limit);
    const pageNumber = parseInt(page);
    const skip = (pageNumber - 1) * pageSize;

    const orders = await Order.find(filter)
      .populate("user", "id name")
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);
    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      orders,
      page: pageNumber,
      pages: Math.ceil(totalOrders / pageSize),
      totalOrders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Update order to paid error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    if (
      order.orderStatus === "cancelled" &&
      orderStatus &&
      orderStatus !== "cancelled"
    ) {
      return res
        .status(400)
        .json({ message: "Cannot change status of a cancelled order" });
    }

    if (status === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateOrderTracking = async (req, res) => {
  try {
    const { trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.trackingNumber = trackingNumber;
    order.orderStatus = "shipped";

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Update order tracking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.isDelivered) {
      return res.status(400).json({ message: "Cannot cancel delivered order" });
    }

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);

      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.orderStatus = "cancelled";

    const updatedOrder = await order.save();
    recalculateUserSegment(updatedOrder.user);
    await notifyUser(updatedOrder.user, {
      type: "order_update",
      title: "Order cancelled",
      message: `Your order #${updatedOrder.orderNumber} has been cancelled.`,
      link: `/profile/orders/${updatedOrder._id}`,
    });
    notifyAdmins({
      type: "order_update",
      title: "Order Cancelled",
      message: `Order #${updatedOrder.orderNumber} was cancelled${req.user.role === "admin" ? " by admin" : " by customer"}.`,
      link: `/admin/orders/?highlight=${updatedOrder._id}`,
    });
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, revenue: { $sum: "$totalPrice" } } },
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    const monthlySales = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .select("orderStatus totalPrice createdAt");

    res.status(200).json({
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].revenue : 0,
      ordersByStatus,
      monthlySales,
      recentOrders,
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
