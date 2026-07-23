const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const collections = [
  "users",
  "products",
  "categories",
  "orders",
  "reviews",
  "coupons",
  "banners",
  "heroslides",
];

async function snapshot() {
  await mongoose.connect(process.env.MONGODB_URI);
  const dir = path.join(__dirname, "../seed-data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  for (const name of collections) {
    const data = await mongoose.connection.db
      .collection(name)
      .find({})
      .toArray();
    fs.writeFileSync(
      path.join(dir, `${name}.json`),
      JSON.stringify(data, null, 2),
    );
  }
  console.log("Snapshot done");
  process.exit(0);
}
snapshot();
