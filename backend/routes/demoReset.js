//backend/routes/demoRoutes
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { getLastActivity } = require("../utils/activityTracker");


const MODELS = {
  Banner: "../models/Banner",
  Category: "../models/Category",
  Chat: "../models/Chat",
  Coupon: "../models/Coupon",
  HeroSlide: "../models/HeroSlide",
  Notification: "../models/Notification",
  Order: "../models/Order",
  PendingOrder: "../models/PendingOrder",
  Product: "../models/Product",
  Review: "../models/Review",
  User: "../models/User",
};
const snapshotDir = path.join(__dirname, "../seed/snapshot");

router.post("/reset", async (req, res) => {
  if (req.headers["x-reset-secret"] !== process.env.RESET_SECRET) {
    return res.status(403).json({ success: false });
  }

  const idleMs = Date.now() - getLastActivity();
  if (idleMs < 2 * 60 * 1000) {
    return res.json({
      success: false,
      skipped: true,
      reason: "Active session detected, reset postponed",
    });
  }
  const results = {};
  for (const [name, modelPath] of Object.entries(MODELS)) {
    const file = path.join(snapshotDir, `${name}.json`);
    if (!fs.existsSync(file)) continue;
    const Model = require(modelPath);
    const docs = JSON.parse(fs.readFileSync(file, "utf-8"));

    await Model.deleteMany({});
    if (docs.length)
      await Model.insertMany(docs, { ordered: false }).catch(() => {});
    results[name] = docs.length;
  }

  res.json({ success: true, resetAt: new Date(), restored: results });
});

module.exports = router;
