const express = require("express");
const router = express.Router();
const {
  validateCoupon,
  getMyRewards,
} = require("../controllers/couponController");
const { protect } = require("../middleware/authMiddleware");

router.post("/validate", protect, validateCoupon);
router.get("/my-rewards", protect, getMyRewards);
module.exports = router;
