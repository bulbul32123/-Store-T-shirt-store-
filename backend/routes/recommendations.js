const express = require("express");
const router = express.Router();
const {
  getRecommendations,
} = require("../controllers/recommendationController");

router.get("/", getRecommendations); // no `protect` — must work for guests too

module.exports = router;
