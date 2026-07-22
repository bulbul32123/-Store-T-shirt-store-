const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadImage = async (req, res) => {
  let tempFilePath = null;

  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });
    }

    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds 5MB limit (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`,
      });
    }

    if (!fs.existsSync(req.file.path)) {
      return res.status(400).json({
        success: false,
        message: "File not found on server",
      });
    }

    tempFilePath = req.file.path;

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Missing Cloudinary credentials",
      });
    }

    const folderMap = {
      product: "payra-store/products",
      banner: "payra-store/banners",
      carousel: "payra-store/carousel",
      asset: "payra-store/assets",
    };
    const uploadOptions = {
      folder: folderMap[req.query.type] || "payra-store/assets",
      resource_type: "auto",
      quality: "auto",
      format: "jpg",
    };

    const result = await cloudinary.uploader.upload(
      req.file.path,
      uploadOptions,
    );

    try {
      fs.unlinkSync(req.file.path);
      console.log("Temporary file removed");
    } catch (unlinkError) {
      console.error(
        "Warning: Could not remove temp file:",
        unlinkError.message,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("ERROR IN UPLOAD PROCESS:", error);
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkError) {
        console.error(
          "Warning: Failed to clean up temp file:",
          unlinkError.message,
        );
      }
    }
    return res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
      details: error.http_code
        ? `Cloudinary HTTP Error ${error.http_code}`
        : "Server error",
    });
  }
};
