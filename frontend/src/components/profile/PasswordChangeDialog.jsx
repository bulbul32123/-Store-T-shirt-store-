"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function PasswordChangeDialog() {
  const { updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetFields = () => {
    setOldPassword("");
    setPassword("");
    setConfirm("");
    setErrors({});
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setErrors({});

    const fieldErrors = {};
    if (!oldPassword)
      fieldErrors.oldPassword = "Please enter your current password.";
    if (password.length < 6)
      fieldErrors.password = "New password must be at least 6 characters.";
    if (password !== confirm) fieldErrors.confirm = "Passwords do not match.";

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    try {
      setSubmitting(true);
      await updateProfile({ oldPassword, password });
      setOpen(false);
      resetFields();
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update password.";
      if (/current password/i.test(message)) {
        setErrors({ oldPassword: message });
      } else if (/at least 6 characters/i.test(message)) {
        setErrors({ password: message });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `h-10 rounded-lg text-sm placeholder:text-gray-400 outline-[#ffb803] focus:ring-[#ffb803] focus:border-[#ffb803] focus-visible:ring-[#ffb803] focus-visible:border-[#ffb803] transition-all ${
      hasError ? "border-red-400" : "border-[#E5E5E5]"
    }`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetFields();
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="rounded-lg border-[#E5E5E5] text-[#111] hover:bg-[#111] hover:text-white font-bold uppercase tracking-wide h-10 w-full justify-center px-4 transition-all"
        >
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-xl p-6 border-[#E5E5E5]">
        <DialogHeader className="border-b border-[#F5F5F5] pb-3 mb-4 text-left">
          <DialogTitle className="text-sm font-bold uppercase tracking-wider text-[#111]">
            Change Password
          </DialogTitle>
          <DialogDescription className="text-xs text-[#6F6F6F] mt-1">
            Verify your identity to choose a strong, secure new password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label
              htmlFor="old-password"
              className="text-xs font-semibold text-[#111]"
            >
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="old-password"
                type={showOld ? "text" : "password"}
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  if (errors.oldPassword)
                    setErrors((p) => ({ ...p, oldPassword: undefined }));
                }}
                className={`${inputClass(!!errors.oldPassword)} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6F6F] hover:text-[#111]"
                tabIndex={-1}
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.oldPassword && (
              <p className="text-xs font-medium text-red-600">
                {errors.oldPassword}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="new-password"
              className="text-xs font-semibold text-[#111]"
            >
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: undefined }));
                }}
                className={`${inputClass(!!errors.password)} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6F6F] hover:text-[#111]"
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="confirm-password"
              className="text-xs font-semibold text-[#111]"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (errors.confirm)
                    setErrors((p) => ({ ...p, confirm: undefined }));
                }}
                className={`${inputClass(!!errors.confirm)} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6F6F] hover:text-[#111]"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm && (
              <p className="text-xs font-medium text-red-600">
                {errors.confirm}
              </p>
            )}
          </div>

          {errors.general && (
            <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {errors.general}
            </p>
          )}

          <DialogFooter className="pt-2 sm:justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#111] hover:bg-[#ffb803] hover:text-[#111] hover:border-[#ffb803] border border-[#111] text-white font-bold uppercase tracking-wider px-8 h-11 text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Updating…" : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
