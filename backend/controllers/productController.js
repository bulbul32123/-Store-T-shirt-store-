
const Product = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require("mongoose");

const cloudinary = require("cloudinary").v2;
const { generateUniqueSlug } = require("../utils/slugGenerator");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getAvailableColors = async (req, res) => {
  try {
    const colors = await Product.aggregate([
      { $unwind: "$colors" },
      {
        $group: {
          _id: { $toLower: { $trim: { input: "$colors.name" } } },
          name: { $first: { $trim: { input: "$colors.name" } } },
          code: { $first: "$colors.code" },
        },
      },
      { $project: { _id: 0, name: 1, code: 1 } },
      { $sort: { name: 1 } },
    ]);
    res.status(200).json(colors);
  } catch (error) {
    console.error("Get available colors error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      category,
      search,
      status,
      dateFilter,
      sort,
      minPrice,
      maxPrice,
      colors,
      sizes,
      minRating,
      freeShipping,
    } = req.query;

    const match = {};

    if (category) {
      match.category = mongoose.Types.ObjectId.isValid(category)
        ? new mongoose.Types.ObjectId(category)
        : category;
    }

    if (search) {
      match.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      if (status === "featured") match.featured = true;
      if (status === "popular") match.popular = true;
      if (status === "newDrop") match.newDrop = true;
    }
    if (freeShipping === "true") match.isFreeShipping = true;
    if (minRating) match.averageRating = { $gte: Number(minRating) };

    let bestSellingIds = [];
    if (status === "bestselling") {
      const sales = await Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.product",
            totalSold: { $sum: "$orderItems.quantity" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 100 },
      ]);
      bestSellingIds = sales.map((s) => s._id);
      match._id = { $in: bestSellingIds };
      match.featured = undefined;
      delete match.featured;
    }

    if (dateFilter) {
      const now = new Date();
      let dateFrom = new Date();
      switch (dateFilter) {
        case "today":
          dateFrom.setHours(0, 0, 0, 0);
          break;
        case "week":
          dateFrom.setDate(now.getDate() - 7);
          break;
        case "month":
          dateFrom.setDate(now.getDate() - 30);
          break;
        case "year":
          dateFrom.setDate(now.getDate() - 365);
          break;
      }
      match.createdAt = { $gte: dateFrom };
    }
    if (sizes) {
      const sizeList = sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (sizeList.length) match.sizes = { $in: sizeList };
    }

    if (colors) {
      const colorList = colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (colorList.length) {
        match.colors = {
          $elemMatch: {
            name: { $in: colorList.map((c) => new RegExp(`^${c}$`, "i")) },
          },
        };
      }
    }

    const pipeline = [{ $match: match }];

    pipeline.push({
      $addFields: {
        finalPrice: {
          $cond: [
            { $gt: ["$discount", 0] },
            {
              $subtract: [
                "$price",
                { $multiply: ["$price", { $divide: ["$discount", 100] }] },
              ],
            },
            "$price",
          ],
        },
      },
    });

    if (minPrice || maxPrice) {
      const priceMatch = {};
      if (minPrice) priceMatch.$gte = Number(minPrice);
      if (maxPrice) priceMatch.$lte = Number(maxPrice);
      pipeline.push({ $match: { finalPrice: priceMatch } });
    }

    let sortStage = { createdAt: -1 };
    if (status === "bestselling" && !sort) {
      sortStage = { _bestSellRank: 1 };
    } else if (sort) {
      const sortMap = {
        "price:asc": { finalPrice: 1 },
        "price:desc": { finalPrice: -1 },
        "rating:desc": { averageRating: -1 },
        newest: { createdAt: -1 },
        popular: { numReviews: -1 },
      };
      sortStage =
        sortMap[sort] ||
        (sort.includes(":")
          ? { [sort.split(":")[0]]: sort.split(":")[1] === "asc" ? 1 : -1 }
          : sortStage);
    }
    if (status === "bestselling") {
      pipeline.push({
        $addFields: {
          _bestSellRank: {
            $indexOfArray: [
              bestSellingIds.map((id) => id.toString()),
              { $toString: "$_id" },
            ],
          },
        },
      });
    }
    pipeline.push({ $sort: sortStage });

    pipeline.push(
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    );

    pipeline.push(
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { orderStatus: "delivered" } },
            { $unwind: "$orderItems" },
            {
              $match: {
                $expr: { $eq: ["$orderItems.product", "$$productId"] },
              },
            },
            {
              $group: {
                _id: null,
                totalSold: { $sum: "$orderItems.quantity" },
              },
            },
          ],
          as: "salesData",
        },
      },
      {
        $addFields: {
          sales: {
            $ifNull: [{ $arrayElemAt: ["$salesData.totalSold", 0] }, 0],
          },
        },
      },
      { $unset: "salesData" },
    );

    pipeline.push({
      $facet: {
        products: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    });

    const result = await Product.aggregate(pipeline);
    const products = result[0]?.products || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    res.status(200).json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json(products);
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPopularProducts = async (req, res) => {
  try {
    const products = await Product.find({ popular: true })
      .sort({ averageRating: -1 })
      .limit(8);

    res.status(200).json(products);
  } catch (error) {
    console.error("Get popular products error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name",
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const formatColorsData = (colors) => {
  if (!colors || !Array.isArray(colors)) return [];

  return colors.map((color) => {
    if (
      typeof color === "object" &&
      color.name &&
      color.code &&
      Array.isArray(color.images)
    ) {
      return color;
    }

    if (typeof color === "object" && color.name && color.code) {
      return {
        name: color.name,
        code: color.code,
        images: [],
      };
    }
    if (typeof color === "string") {
      return {
        name: color,
        code: "#000000",
        images: [],
      };
    }

    return {
      name: "Unknown",
      code: "#000000",
      images: [],
    };
  });
};

exports.createProduct = async (req, res) => {
  try {
    const body = req.body;
    console.log("INCOMING PRODUCT DATA:", JSON.stringify(body, null, 2));

    if (!body.name || !body.description || !body.price || !body.category) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, description, price, and category are required",
      });
    }

    const slug = await generateUniqueSlug(body.name);

    if (body.colors) {
      body.colors = formatColorsData(body.colors);
    }

    let safeSizes = ["M"];
    if (body.sizes) {
      if (typeof body.sizes === "string") {
        try {
          const parsed = JSON.parse(body.sizes);
          if (Array.isArray(parsed)) {
            safeSizes = parsed;
          } else {
            safeSizes = [body.sizes];
          }
        } catch (e) {
          safeSizes = [body.sizes];
        }
      } else if (Array.isArray(body.sizes)) {
        safeSizes = body.sizes;
      }

      const allowedSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
      safeSizes = safeSizes.filter((size) => allowedSizes.includes(size));

      if (safeSizes.length === 0) {
        safeSizes = ["M"];
      }
    }

    const productData = {
      name: body.name,
      slug: slug,
      description: body.description,
      price: Number(body.price) || 0,
      category: body.category,
      images: body.images || [],
      sizes: safeSizes,
      colors: body.colors || [],
    };

    if (body.discount !== undefined)
      productData.discount = Number(body.discount) || 0;
    if (body.stock !== undefined) productData.stock = Number(body.stock) || 0;
    if (body.featured !== undefined)
      productData.featured = Boolean(
        body.featured === true || body.featured === "true",
      );
    if (body.popular !== undefined)
      productData.popular = Boolean(
        body.popular === true || body.popular === "true",
      );
    if (body.newDrop !== undefined)
      productData.newDrop = Boolean(
        body.newDrop === true || body.newDrop === "true",
      );
    if (body.isFreeShipping !== undefined)
      productData.isFreeShipping = Boolean(
        body.isFreeShipping === true || body.isFreeShipping === "true",
      );
    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("PRODUCT CREATION ERROR:", error);

    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      return res.status(400).json({
        success: false,
        message:
          "A product with this name already exists. Please use a different name.",
        error: "Duplicate product name",
      });
    }

    let errorMessage = "Failed to create product";
    let errorDetails = {};

    if (error.name === "ValidationError" && error.errors) {
      Object.keys(error.errors).forEach((key) => {
        errorDetails[key] = error.errors[key].message;
      });
      errorMessage = "Validation failed";
    }

    res.status(400).json({
      success: false,
      message: errorMessage,
      errors: errorDetails,
      details: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;

    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    if (updates.name && updates.name !== existingProduct.name) {
      updates.slug = await generateUniqueSlug(updates.name, productId);
    }

    if (updates.colors) {
      updates.colors = formatColorsData(updates.colors);
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("PRODUCT UPDATE ERROR:", error);

    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      return res.status(400).json({
        success: false,
        message:
          "A product with this name already exists. Please use a different name.",
        error: "Duplicate product name",
      });
    }

    res.status(400).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

exports.addColorImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { colorName } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const colorIndex = product.colors.findIndex(
      (color) => color.name === colorName,
    );

    if (colorIndex === -1) {
      return res.status(404).json({ message: "Color variant not found" });
    }

    const uploadPromises = req.files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `payra-store/products/${product.slug}/${colorName}`,
        width: 800,
        crop: "scale",
        format: "jpg",
      });

      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    product.colors[colorIndex].images = [
      ...product.colors[colorIndex].images,
      ...uploadedImages,
    ];
    await product.save();

    res.status(200).json({
      success: true,
      message: "Images added to color variant successfully",
      product,
    });
  } catch (error) {
    console.error("Add color images error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteColorImage = async (req, res) => {
  try {
    const { id, colorName, imageIndex } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const colorIndex = product.colors.findIndex(
      (color) => color.name === colorName,
    );

    if (colorIndex === -1) {
      return res.status(404).json({ message: "Color variant not found" });
    }

    const imageIdx = parseInt(imageIndex);
    if (imageIdx < 0 || imageIdx >= product.colors[colorIndex].images.length) {
      return res.status(404).json({ message: "Image not found" });
    }

    const image = product.colors[colorIndex].images[imageIdx];

    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    product.colors[colorIndex].images.splice(imageIdx, 1);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      product,
    });
  } catch (error) {
    console.error("Delete color image error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }
    }

    if (product.colors && product.colors.length > 0) {
      for (const color of product.colors) {
        if (color.images && color.images.length > 0) {
          for (const image of color.images) {
            if (image.public_id) {
              await cloudinary.uploader.destroy(image.public_id);
            }
          }
        }
      }
    }

    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.uploadProductImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadPromises = req.files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "payra-store/products",
        width: 800,
        crop: "scale",
        format: "jpg",
      });

      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    product.images = [...product.images, ...uploadedImages];
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    console.error("Upload product images error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteProductImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const image = product.images.id(imageId);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    product.images = product.images.filter(
      (img) => img._id.toString() !== imageId,
    );
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    console.error("Delete product image error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addProductReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadyReviewed = product.ratings.find(
      (r) => r.user.toString() === userId,
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const newReview = {
      user: userId,
      rating: Number(rating),
      review,
      date: Date.now(),
    };

    product.ratings.push(newReview);

    await product.save();

    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    console.error("Add product review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
