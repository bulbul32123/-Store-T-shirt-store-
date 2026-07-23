const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

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

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const dir = path.join(__dirname, "../seed/snapshot");
  fs.mkdirSync(dir, { recursive: true });

  for (const [name, modelPath] of Object.entries(MODELS)) {
    const Model = require(modelPath);
    const docs = await Model.find({}).lean();
    fs.writeFileSync(
      path.join(dir, `${name}.json`),
      JSON.stringify(docs, null, 2),
    );
    console.log(name, docs.length);
  }
  process.exit(0);
}
run();
