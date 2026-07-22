const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { admin, protect } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");
const adminOrderController = require("../controllers/adminOrderController");
const adminCustomerController = require("../controllers/adminCustomerController"); // ← NEW
const reviewController = require("../controllers/reviewController");
const chatController = require("../controllers/chatController");

const {
  createCoupon,
  getCoupons,
  toggleCouponStatus,
  deleteCoupon,
} = require("../controllers/couponcontroller");

router.use(protect);
router.use(admin);

router.get("/stats", adminController.getStats);
router.get("/login", adminController.login);
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

router.get("/orders", adminOrderController.getOrders);
router.patch("/orders/bulk-status", adminOrderController.bulkUpdateStatus);
router.get("/orders/:id", adminOrderController.getOrderById);
router.patch("/orders/:id", adminOrderController.updateOrder);

router.get("/customers", adminCustomerController.getCustomers);
router.get("/customers/:id", adminCustomerController.getCustomerById);
router.patch("/customers/:id", adminCustomerController.updateCustomer);

router.route("/coupons").get(getCoupons).post(createCoupon);
router.patch("/coupons/:id/toggle-status", toggleCouponStatus);
router.delete("/coupons/:id", deleteCoupon);


router.use(protect);
router.use(admin);


router.get("/reviews/stats", reviewController.getReviewStats);

router.get("/reviews/reports", reviewController.getReportedReviews);
router.get("/reviews", reviewController.getReviews);

router.patch("/reviews/bulk", reviewController.bulkUpdateStatus);

router.patch("/reviews/:id/approve", reviewController.approveReview);
router.patch("/reviews/:id/reject", reviewController.rejectReview);
router.delete("/reviews/:id", reviewController.deleteReview);
router.get("/reviews/:id", reviewController.getReviewById);

router.get("/chats", chatController.getAdminChats);
router.get("/chats/:id", chatController.getAdminChatById);
router.patch("/chats/:id/notes", chatController.updateChatCustomerNote);
router.delete("/chats/:id", chatController.deleteChat);

router.get("/reports/overview", reportController.getReportOverview);
router.get("/reports/acquisition", reportController.getAcquisitionTrend);
router.get("/reports/retention", reportController.getRetentionTrend);
router.get("/reports/segments", reportController.getCustomerSegments);
router.get("/reports/revenue", reportController.getRevenueTrend);
router.get("/reports/top-products", reportController.getTopProductsReport);

module.exports = router;
