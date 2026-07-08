'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import PasswordChangeDialog from './PasswordChangeDialog';
import AvatarUploader from './AvatarUploader';

export default function AccountForm() {
    const { user, updateProfile, loading } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        gender: user?.gender || '',
        phoneNumber: user?.phoneNumber || '',
        dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
    });
    const [dirty, setDirty] = useState(false);

    const handleChange = (field) => (e) => {
        const value = typeof e === 'string' ? e : e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
        setDirty(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(form);
            setDirty(false);
        } catch {
            // AuthContext already toasts the error
        }
    };

    return (
        <div className="space-y-10">
            <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#6F6F6F] mb-4">Photo</h3>
                <AvatarUploader />
            </section>

            <form onSubmit={handleSave} className="space-y-8">
                <section className="space-y-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#6F6F6F]">Personal details</h3>

                    <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={form.name} onChange={handleChange('name')} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="gender">Gender</Label>
                            <Select value={form.gender} onValueChange={handleChange('gender')}>
                                <SelectTrigger id="gender">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone">Phone number</Label>
                            <Input id="phone" type="tel" value={form.phoneNumber} onChange={handleChange('phoneNumber')} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="dob">Date of birth</Label>
                            <Input id="dob" type="date" value={form.dateOfBirth} onChange={handleChange('dateOfBirth')} />
                        </div>
                    </div>
                </section>

                <section className="space-y-5 border-t border-[#E5E5E5] pt-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#6F6F6F]">Login</h3>
                    <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user?.email || ''} disabled className="bg-[#F5F5F5] text-[#6F6F6F]" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Password</Label>
                            <PasswordChangeDialog />
                        </div>
                    </div>
                </section>

                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={!dirty || loading}
                        className="rounded-full bg-[#111] hover:bg-white hover:text-[#111] border border-[#111] text-white font-bold uppercase tracking-wide px-8 h-11 transition-colors"
                    >
                        {loading ? 'Saving…' : 'Save changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}