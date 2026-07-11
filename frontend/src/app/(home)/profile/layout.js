'use client';

import { useAuth } from '@/context/AuthContext';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { motion } from 'framer-motion';

export default function ProfileLayout({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-6 w-6 rounded-full border-2 border-[#111] border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Welcome band */}
            <div className="border-b border-[#E5E5E5]">
                <div className="max-w-6xl mx-auto px-6 py-10 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-[#111] text-white flex items-center justify-center text-xl font-bold uppercase shrink-0 overflow-hidden">
                        {user?.profilePicture?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.profilePicture.url} alt={user?.name} className="h-full w-full object-cover" />
                        ) : (
                            user?.name?.charAt(0) || '?'
                        )}
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-[#6F6F6F]">Welcome back</p>
                        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-[#111]">
                            {user?.name || 'Member'}
                        </h1>
                    </div>
                    <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] text-xs font-bold uppercase tracking-wide px-3 py-1">
                        Member
                    </span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-10">
                <ProfileSidebar />
                <motion.main
                    key={typeof window !== 'undefined' ? window.location.pathname : 'profile'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex-1 min-w-0"
                >
                    {children}
                </motion.main>
            </div>
        </div>
    );
}