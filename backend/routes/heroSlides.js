const express = require("express");
const router = express.Router();
const {
  getHeroSlides,
  getHeroSlideByProduct,
  upsertHeroSlide,
  deleteHeroSlide,
} = require("../controllers/heroSlideController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getHeroSlides);
router.get("/product/:productId", protect, admin, getHeroSlideByProduct);
router.post("/", protect, admin, upsertHeroSlide);
router.delete("/product/:productId", protect, admin, deleteHeroSlide);

module.exports = router;
