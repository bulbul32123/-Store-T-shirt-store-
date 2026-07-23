"use client";

import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function ProfileLayout({ children }) {
  const { user, loading } = useAuth();



  return (
    <div className="min-h-screen bg-white">
      
      {loading ? (
        <div className="border-b border-[#E5E5E5]">
          <div className="max-w-6xl mx-auto px-6 py-10 flex items-center gap-4">
            
            <div className="h-16 w-16 rounded-full bg-[#E5E5E5] shrink-0" />
            <div className="space-y-2">
              
              <div className="h-3 w-24 bg-[#E5E5E5] rounded" />
              
              <div className="h-7 w-44 md:w-56 bg-[#E5E5E5] rounded" />
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-[#E5E5E5]">
          <div className="max-w-6xl mx-auto px-6 py-10 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#111] text-white flex items-center justify-center text-xl font-bold uppercase shrink-0 overflow-hidden">
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
            <div>
              <p className="text-xs uppercase tracking-widest text-[#6F6F6F]">
                Welcome back
              </p>
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-[#111]">
                {user?.name || "Member"}
              </h1>
            </div>
            {user?.role === "admin" && (
              <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] text-xs font-bold uppercase tracking-wide px-3 py-1">
                Member
              </span>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-10">
        <ProfileSidebar />
        <motion.main
          key={
            typeof window !== "undefined" ? window.location.pathname : "profile"
          }
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 min-w-0"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
