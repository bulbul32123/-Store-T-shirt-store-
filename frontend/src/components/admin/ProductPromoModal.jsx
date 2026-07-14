"use client";
import { useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import toast from "react-hot-toast";
import { RiImageAddLine } from "react-icons/ri";

const CONFIG = {
  hero: {
    label: "Hero Carousel",
    endpoint: "hero-slides",
    removeMsg: "Removed from hero carousel",
    savedMsg: "Hero carousel updated",
  },
  banner: {
    label: "Banner",
    endpoint: "banner",
    removeMsg: "Banner removed",
    savedMsg: "Banner updated",
  },
};

export default function ProductPromoModal({
  type,
  product,
  existingItem,
  onClose,
  onSaved,
  onRemoved,
}) {
  const cfg = CONFIG[type];
  const [title, setTitle] = useState(existingItem?.title || "");
  const [showStatus, setShowStatus] = useState(
    existingItem?.showStatus || false,
  );
  const [preview, setPreview] = useState(existingItem?.image?.url || null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async () => {
    if (!preview) return toast.error("Please add an image");
    setLoading(true);
    try {
      let image = existingItem?.image;
      if (file) {
        const fd = new FormData();
        fd.append("image", file);
        const { data } = await axios.post(`${API_URL}/api/upload`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        image = { url: data.url, public_id: data.public_id };
      }
      const { data } = await axios.post(`${API_URL}/api/${cfg.endpoint}`, {
        product: product._id,
        title,
        showStatus,
        image,
      });
      toast.success(cfg.savedMsg);
      onSaved(data.slide || data.banner);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await axios.delete(
        `${API_URL}/api/${cfg.endpoint}/product/${product._id}`,
      );
      toast.success(cfg.removeMsg);
      onRemoved();
    } catch (err) {
      toast.error("Failed to remove");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 h-full flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-medium">
          {cfg.label} — {product.name}
        </h2>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`${type}File`).click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${dragOver ? "bg-[#ffb803]/30 border-[#ffb803]" : "border-[#ffb803]"}`}
        >
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="mx-auto h-32 object-cover rounded-md"
            />
          ) : (
            <>
              <RiImageAddLine className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Drag & drop an image, or click to browse
              </p>
            </>
          )}
          <input
            id={`${type}File`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional, defaults to product name)"
          className="w-full border border-[#ffb803]! outline-[#ffb803] focus:ring-[#ffb803] focus:border-[#ffb803] rounded-md px-3 py-2 text-sm"
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showStatus}
            onChange={(e) => setShowStatus(e.target.checked)}
            className="h-4 w-4 text-[#ffb803] focus:ring-[#ffb803] border-gray-300 rounded"
          />
          Show product status badges (New, Free Shipping, Sale)
        </label>

        <div className="flex justify-between items-center pt-2">
          {existingItem ? (
            <button
              onClick={handleRemove}
              disabled={loading}
              className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              Remove
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm bg-primary text-black hover:bg-primary/80 rounded-md disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
