const HeroSlide = require("../models/HeroSlide");

exports.getHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find()
      .sort({ order: 1 })
      .populate("product", "name price discount newDrop isFreeShipping");
    res.json({ slides });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getHeroSlideByProduct = async (req, res) => {
  try {
    const slide = await HeroSlide.findOne({ product: req.params.productId });
    res.json({ slide: slide || null });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.upsertHeroSlide = async (req, res) => {
  try {
 const { product, title, showStatus, image } = req.body;
 if (!product || !image?.url) {
   return res.status(400).json({ message: "product and image are required" });
 }
 const slide = await HeroSlide.findOneAndUpdate(
   { product },
   { title, showStatus, image },
   { new: true, upsert: true, runValidators: true },
 );
    res.status(201).json({ slide });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteHeroSlide = async (req, res) => {
  try {
    await HeroSlide.findOneAndDelete({ product: req.params.productId });
    res.json({ message: "Removed from hero carousel" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
