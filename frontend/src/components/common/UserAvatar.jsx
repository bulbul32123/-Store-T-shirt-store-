"use client";
import React from "react";

const AVATAR_PALETTES = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
];

function getAvatarStyle(str = "") {
  if (!str) return AVATAR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

export default function UserAvatar({
  user,
  size = "h-10 w-10",
  textSize = "text-sm",
  className = "",
}) {
  const imageUrl = user?.avatar || user?.profilePicture?.url;
  const name = user?.name || "Unknown";
  const identifier = user?._id || name;
  const palette = getAvatarStyle(identifier);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${name}'s avatar`}
        className={`${size} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${size} ${textSize} rounded-full flex items-center justify-center font-bold shadow-sm shrink-0 uppercase select-none ${palette.bg} ${palette.text} ${className}`}
    >
      {name[0] || "?"}
    </div>
  );
}
