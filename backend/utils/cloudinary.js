// utils/cloudinary.js
const cloudinary = require("cloudinary").v2;
const { CLOUDINARY_CONFIG } = require("../config");

cloudinary.config(CLOUDINARY_CONFIG);

exports.uploadToCloudinary = async (
  filePath,
  folder = "payra-store/assets",
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Error uploading image to Cloudinary");
  }
};

exports.deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Error deleting image from Cloudinary");
  }
};
