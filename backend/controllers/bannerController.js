const Banner = require("../models/Banner");

exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne().populate(
      "product",
      "name slug newDrop isFreeShipping discount",
    );
    res.json({ banner: banner || null });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBannerByProduct = async (req, res) => {
  try {
    const banner = await Banner.findOne({ product: req.params.productId });
    res.json({ banner: banner || null });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.upsertBanner = async (req, res) => {
  try {
    const { product, title, showStatus, image } = req.body;
    if (!product || !image?.url) {
      return res
        .status(400)
        .json({ message: "product and image are required" });
    }
    const banner = await Banner.findOneAndUpdate(
      {},
      { product, title, showStatus, image },
      { new: true, upsert: true, runValidators: true },
    );
    res.status(201).json({ banner });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    await Banner.findOneAndDelete({ product: req.params.productId });
    res.json({ message: "Banner removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
