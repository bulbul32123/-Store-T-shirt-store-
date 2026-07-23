//confiq
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'tshirt_store';
const CLOUDINARY_CLOUD_NAME =process.env.CLOUDINARY_CLOUD_NAME || "your-cloud-name";

export {
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_CLOUD_NAME
}; 