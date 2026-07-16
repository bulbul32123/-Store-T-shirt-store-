const express = require("express");
const router = express.Router();
const {
  getBanner,
  getBannerByProduct,
  upsertBanner,
  deleteBanner,
} = require("../controllers/bannerController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getBanner);
router.delete("/product/:productId", protect, admin, deleteBanner);
router.post("/", protect, admin, upsertBanner);
router.get("/product/:productId", protect, admin, getBannerByProduct);
router.get("/current-owner", protect, admin, getBanner);

module.exports = router;
