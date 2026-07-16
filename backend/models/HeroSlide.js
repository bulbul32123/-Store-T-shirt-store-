const mongoose = require("mongoose");

const heroSlideSchema = new mongoose.Schema(
  {
    image: { url: String, public_id: String },
    title: { type: String, default: "" },
    showStatus: { type: Boolean, default: false },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("HeroSlide", heroSlideSchema);
