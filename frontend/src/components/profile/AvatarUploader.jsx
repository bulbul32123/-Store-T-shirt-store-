"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/utils/config";
import axios from "axios";
import { Camera, Loader2 } from "lucide-react"; 
import { useRef, useState } from "react";
import toast from "react-hot-toast";

export default function AvatarUploader() {
  const { user, refreshUser } = useAuth();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);
      const { data: uploadData } = await axios.post(
        `${API_URL}/api/upload/updated-profile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      await axios.put(`${API_URL}/api/auth/update-profile`, {
        profilePicture: {
          url: uploadData.url,
          public_id: uploadData.public_id,
        },
      });

      await refreshUser();
      toast.success("Photo updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <div className="h-32 w-32 rounded-full bg-[#F5F5F5] overflow-hidden flex items-center justify-center text-3xl font-bold uppercase text-[#111] border border-gray-100 shadow-sm">
        {user?.profilePicture?.url ? (
          <img
            src={user.profilePicture.url}
            alt={user?.name}
            className="h-full w-full object-cover"
          />
        ) : (
          user?.name?.charAt(0) || "?"
        )}
      </div>

      <Button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white p-0 text-[#111] shadow-md border border-gray-200 hover:bg-[#111] hover:text-white transition-colors flex items-center justify-center"
        title="Change photo"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
