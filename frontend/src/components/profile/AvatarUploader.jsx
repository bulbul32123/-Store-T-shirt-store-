'use client';

import { useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/utils/config';
import { Button } from '@/components/ui/button';

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
            formData.append('image', file);

            const { data: uploadData } = await axios.post(`${API_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
console.log('uploadData:', uploadData);
            await axios.put(`${API_URL}/api/auth/update-profile`, {
                profilePicture: { url: uploadData.url, public_id: uploadData.public_id },
            });

            await refreshUser();
            toast.success('Photo updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };
console.log('user profile data:', user);
    return (
        <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-[#F5F5F5] overflow-hidden flex items-center justify-center text-2xl font-bold uppercase text-[#111]">
                {user?.profilePicture?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.profilePicture.url} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                    user?.name?.charAt(0) || '?'
                )}
            </div>
            <div>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                    className="rounded-full border-[#111] text-[#111] hover:bg-[#111] hover:text-white font-bold uppercase tracking-wide"
                >
                    {uploading ? 'Uploading…' : 'Change photo'}
                </Button>
            </div>
        </div>
    );
}