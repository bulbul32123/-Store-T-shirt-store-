const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, chatController.getMyChat);

module.exports = router;
