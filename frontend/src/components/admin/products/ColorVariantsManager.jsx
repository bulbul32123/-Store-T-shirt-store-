"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/utils/config";
import axios from "axios";
import { useRef, useState } from "react";
import { SketchPicker } from "react-color";
import toast from "react-hot-toast";
import {
  RiAddLine,
  RiCloseCircleLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiImageAddLine,
  RiLoader4Line,
} from "react-icons/ri";

const MAX_IMAGES = 5;

export default function ColorVariantsManager({ colors, onChange, disabled }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("#FF0000");
  const [showPicker, setShowPicker] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRefs = useRef({});

  const openCreate = () => {
    setEditingIndex(-1);
    setName("");
    setCode("#FF0000");
    setShowPicker(false);
    setDialogOpen(true);
  };

  const openEdit = (index) => {
    setEditingIndex(index);
    setName(colors[index].name);
    setCode(colors[index].code);
    setShowPicker(false);
    setDialogOpen(true);
  };

  const saveVariant = () => {
    if (!name.trim()) return toast.error("Please enter a color name");
    const exists = colors.some(
      (c, i) =>
        c.name.toLowerCase() === name.toLowerCase() && i !== editingIndex,
    );
    if (exists) return toast.error("Color variant already exists");

    if (editingIndex === -1) {
      onChange([{ name: name.trim(), code, images: [] }, ...colors]);
    } else {
      const updated = [...colors];
      updated[editingIndex] = {
        ...updated[editingIndex],
        name: name.trim(),
        code,
      };
      onChange(updated);
    }
    setDialogOpen(false);
  };

  const removeVariant = (index) => {
    onChange(colors.filter((_, i) => i !== index));
  };

  const uploadFiles = async (index, files) => {
    const remaining = MAX_IMAGES - colors[index].images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images per color`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast.error(
        `Only ${remaining} more image(s) allowed — extra files skipped`,
      );
    }

    setUploadingIndex(index);
    try {
      const uploaded = await Promise.all(
        toUpload.map(async (file) => {
          const fd = new FormData();
          fd.append("image", file);
          const { data } = await axios.post(`${API_URL}/api/upload`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          return {
            url: data.url,
            public_id: `temp_${Date.now()}_${Math.random()}`,
          };
        }),
      );
      const updated = [...colors];
      updated[index] = {
        ...updated[index],
        images: [...updated[index].images, ...uploaded],
      };
      onChange(updated);
      toast.success(`${uploaded.length} image(s) added`);
    } catch (err) {
      toast.error("Failed to upload images");
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeImage = (colorIndex, imageIndex) => {
    const updated = [...colors];
    updated[colorIndex] = {
      ...updated[colorIndex],
      images: updated[colorIndex].images.filter((_, i) => i !== imageIndex),
    };
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Color Variants <span className="text-red-500">*</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Up to {MAX_IMAGES} images per color. New variants appear at the top.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          disabled={disabled}
          className="bg-[#ffb803] text-black hover:bg-[#ffb803]/90"
        >
          <RiAddLine className="mr-1.5 text-lg" />
          Add Color Variant
        </Button>
      </div>

      {colors.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-xl text-gray-500">
          <RiImageAddLine className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h4 className="text-sm font-semibold text-gray-700">
            No color variants yet
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Add a color to start uploading its gallery.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {colors.map((color, index) => (
            <div
              key={`${color.name}-${index}`}
              className="border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full border-2 border-white shadow ring-2 ring-gray-100 shrink-0"
                    style={{ backgroundColor: color.code }}
                  />
                  <div>
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      {color.name}
                      <span className="font-mono text-xs text-gray-400 font-normal">
                        {color.code}
                      </span>
                    </div>
                    <Badge
                      variant={
                        color.images.length === 0 ? "destructive" : "secondary"
                      }
                      className="mt-1"
                    >
                      {color.images.length}/{MAX_IMAGES} images
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(index)}
                    disabled={disabled}
                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition disabled:opacity-50"
                  >
                    <RiEdit2Line />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    disabled={disabled}
                    className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                  >
                    <RiDeleteBin6Line />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {color.images.length < MAX_IMAGES && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverIndex(index);
                    }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverIndex(null);
                      uploadFiles(index, e.dataTransfer.files);
                    }}
                    onClick={() =>
                      !disabled && fileInputRefs.current[index]?.click()
                    }
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition mb-4 ${
                      dragOverIndex === index
                        ? "border-[#ffb803] bg-[#ffb803]/5"
                        : "border-gray-200 hover:border-[#ffb803] hover:bg-gray-50"
                    } ${uploadingIndex === index ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    {uploadingIndex === index ? (
                      <div className="flex items-center justify-center gap-2 py-2">
                        <RiLoader4Line className="animate-spin text-[#ffb803] text-xl" />
                        <span className="text-sm font-medium text-gray-600">
                          Uploading...
                        </span>
                      </div>
                    ) : (
                      <>
                        <RiImageAddLine className="mx-auto h-8 w-8 text-gray-400 mb-1.5" />
                        <p className="text-sm text-gray-700 font-medium">
                          Drag & drop or click to upload
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {MAX_IMAGES - color.images.length} slot(s) left · PNG,
                          JPG, WEBP up to 5MB
                        </p>
                      </>
                    )}
                    <input
                      ref={(el) => (fileInputRefs.current[index] = el)}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        uploadFiles(index, files);
                        e.target.value = "";
                      }}
                      disabled={disabled}
                    />
                  </div>
                )}

                {color.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {color.images.map((image, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50"
                      >
                        <img
                          src={image.url}
                          alt={`${color.name} ${imgIndex + 1}`}
                          className="w-full h-full object-cover transition group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(index, imgIndex)}
                            disabled={disabled}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5"
                          >
                            <RiCloseCircleLine className="text-lg" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex === -1
                ? "Create Color Variant"
                : "Edit Color Variant"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Variant Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Onyx Black, Forest Green"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Color</Label>
              <div className="flex items-center gap-3 border border-gray-300 rounded-lg p-1.5">
                <div
                  className="w-8 h-8 rounded-md cursor-pointer border border-gray-200"
                  style={{ backgroundColor: code }}
                  onClick={() => setShowPicker(!showPicker)}
                />
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="border-0 shadow-none font-mono text-xs w-24"
                />
              </div>
              {showPicker && (
                <div className="relative z-20 mt-2">
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowPicker(false)}
                  />
                  <div className="absolute z-30 top-0 left-0 shadow-xl rounded-lg overflow-hidden">
                    <SketchPicker
                      color={code}
                      onChange={(c) => setCode(c.hex)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveVariant}
              className="bg-[#ffb803] text-black hover:bg-[#ffb803]/90"
            >
              Save Variant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
