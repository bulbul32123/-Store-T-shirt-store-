// order.js routes
const express = require("express");
const router = express.Router();
const {
  createOrder,
  createCheckoutSession,
  getOrderBySession,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderStatus,
  updateOrderTracking,
  cancelOrder,
  getOrderStats,
} = require("../controllers/orderController");
const {
  protect,
  admin,
  notSuspended,
} = require("../middleware/authMiddleware");

router.post(
  "/create-checkout-session",
  protect,
  notSuspended,
  createCheckoutSession,
);
router.get("/by-session/:sessionId", protect, getOrderBySession);
router.post("/", protect, notSuspended, createOrder);

router.get("/my-orders", protect, getMyOrders);
router.get("/stats", protect, admin, getOrderStats);
router.get("/:id", protect, getOrderById);
router.put("/:id/pay", protect, updateOrderToPaid);
router.put("/:id/cancel", protect, cancelOrder);

router.get("/", protect, admin, getOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);
router.put("/:id/tracking", protect, admin, updateOrderTracking);

module.exports = router;
