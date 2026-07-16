const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    image: { url: String, public_id: String },
    title: { type: String, default: "" },
    showStatus: { type: Boolean, default: false },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Banner", bannerSchema);
