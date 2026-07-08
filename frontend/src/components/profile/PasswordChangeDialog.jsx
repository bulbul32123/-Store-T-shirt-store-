'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';

export default function PasswordChangeDialog() {
    const { updateProfile } = useAuth();
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [err, setErr] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr('');
        if (password.length < 6) return setErr('Password must be at least 6 characters.');
        if (password !== confirm) return setErr('Passwords do not match.');

        try {
            setSubmitting(true);
            await updateProfile({ password });
            setOpen(false);
            setPassword('');
            setConfirm('');
        } catch {
            // AuthContext toasts the error
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-[#111] text-[#111] hover:bg-[#111] hover:text-white font-bold uppercase tracking-wide h-11 w-full justify-start px-4"
                >
                    Change password
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="uppercase tracking-tight">Change password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="new-password">New password</Label>
                        <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="confirm-password">Confirm password</Label>
                        <Input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                    </div>
                    {err && <p className="text-sm text-red-600">{err}</p>}
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="rounded-full bg-[#111] hover:bg-white hover:text-[#111] border border-[#111] text-white font-bold uppercase tracking-wide"
                        >
                            {submitting ? 'Updating…' : 'Update password'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}