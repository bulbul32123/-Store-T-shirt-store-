//categoryController.js
const Category = require("../models/Category");
const Product = require("../models/Product");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("parent", "name slug")
      .sort({ name: 1 });

    res.status(200).json({ categories });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { slug: id },
      ],
    }).populate("parent", "name slug");

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.createCategory = async (req, res) => {
  try {
    const { name, featured, parent } = req.body;
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }
    const category = new Category({
      name,
      featured: featured || false,
      parent: parent || null,
    });
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.path,
        "payra-store/categories-image",
      );
      category.image = {
        url: result.url,
        public_id: result.public_id,
      };
    }

    await category.save();

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, featured, parent } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    if (parent && parent.toString() === id.toString()) {
      return res
        .status(400)
        .json({ message: "Category cannot be its own parent" });
    }
    category.name = name || category.name;

    if (featured !== undefined) {
      category.featured = featured;
    }

    if (parent !== undefined) {
      category.parent = parent || null;
    }
    if (req.file) {
      if (category.image && category.image.public_id) {
        await deleteFromCloudinary(category.image.public_id);
      }

      const result = await uploadToCloudinary(
        req.file.path,
        "payra-store/categories-image",
      );
      category.image = {
        url: result.url,
        public_id: result.public_id,
      };
    }
    if (name && name !== category.name) {
      category.slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
    }

    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const productsCount = await Product.countDocuments({ category: id });

    if (productsCount > 0) {
      return res.status(400).json({
        message: "Cannot delete category with associated products",
        productsCount,
      });
    }
    const childCategoriesCount = await Category.countDocuments({ parent: id });

    if (childCategoriesCount > 0) {
      return res.status(400).json({
        message: "Cannot delete category with child categories",
        childCategoriesCount,
      });
    }
    if (category.image && category.image.public_id) {
      await deleteFromCloudinary(category.image.public_id);
    }
    await Category.deleteOne({ _id: id });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = await Category.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { slug: id },
      ],
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const products = await Product.find({ category: category._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ category: category._id });

    res.status(200).json({
      category,
      products,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching category products:", error);
    res.status(500).json({ message: "Server error" });
  }
};
