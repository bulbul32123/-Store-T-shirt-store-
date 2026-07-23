"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import AvatarUploader from "./AvatarUploader";
import PasswordChangeDialog from "./PasswordChangeDialog";

export default function AccountForm() {
  const { user, updateProfile, loading } = useAuth();
  console.log(user);

  const [form, setForm] = useState({
    name: user?.name || "",
    gender: user?.gender || "",
    phone: user?.phone || user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      postalCode: user?.address?.postalCode || "",
      country: user?.address?.country || "Bangladesh",
    },
  });

  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (user) {
      const newForm = {
        name: user.name || "",
        gender: user.gender ? String(user.gender).trim().toLowerCase() : "",
        phone: user?.phone || user?.phoneNumber || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          postalCode: user.address?.postalCode || "",
          country: user.address?.country || "Bangladesh",
        },
      };
      setForm(newForm);
    }
  }, [user]);

  const handleChange = (field) => (e) => {
    const value = typeof e === "string" ? e : e.target.value;

    if (field.startsWith("address.")) {
      const addressKey = field.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressKey]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
    setDirty(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      setDirty(false);
    } catch {}
  };

  const inputClass =
    "h-10 rounded-lg border-[#E5E5E5] text-sm placeholder:text-gray-400 outline-[#ffb803] focus:ring-[#ffb803] focus:border-[#ffb803] focus-visible:ring-[#ffb803] focus-visible:border-[#ffb803] transition-all";
  if (!user || loading)
    return (
      <div className="animate-pulse">
        <div className="h-6 w-32 bg-[#E5E5E5] rounded mb-2" />
        <div className="h-4 w-72 bg-[#E5E5E5] rounded mb-8" />

        <div className="max-w-4xl mx-auto space-y-8 pb-16">
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 flex flex-col items-center">
            <div className="h-3 w-24 bg-[#E5E5E5] rounded mb-4" />
            <div className="h-24 w-24 rounded-full bg-[#E5E5E5]" />
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-6">
            <div className="border-b border-[#F5F5F5] pb-3 space-y-1.5">
              <div className="h-4 w-36 bg-[#E5E5E5] rounded" />
              <div className="h-3 w-56 bg-[#E5E5E5] rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="md:col-span-3 space-y-2">
                  <div className="h-3.5 w-20 bg-[#E5E5E5] rounded" />
                  <div className="h-10 w-full bg-[#E5E5E5] rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-6">
            <div className="border-b border-[#F5F5F5] pb-3 space-y-1.5">
              <div className="h-4 w-36 bg-[#E5E5E5] rounded" />
              <div className="h-3 w-64 bg-[#E5E5E5] rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
              <div className="md:col-span-6 space-y-2">
                <div className="h-3.5 w-24 bg-[#E5E5E5] rounded" />
                <div className="h-10 w-full bg-[#E5E5E5] rounded-lg" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="md:col-span-3 space-y-2">
                  <div className="h-3.5 w-20 bg-[#E5E5E5] rounded" />
                  <div className="h-10 w-full bg-[#E5E5E5] rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-6">
            <div className="border-b border-[#F5F5F5] pb-3 space-y-1.5">
              <div className="h-4 w-36 bg-[#E5E5E5] rounded" />
              <div className="h-3 w-48 bg-[#E5E5E5] rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-5 items-end">
              <div className="md:col-span-3 space-y-2">
                <div className="h-3.5 w-24 bg-[#E5E5E5] rounded" />
                <div className="h-10 w-full bg-[#E5E5E5] rounded-lg" />
              </div>
              <div className="md:col-span-3">
                <div className="h-10 w-44 bg-[#E5E5E5] rounded-lg" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <div className="h-12 w-40 bg-[#E5E5E5] rounded-full" />
          </div>
        </div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6  flex flex-col items-center">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#6F6F6F] mb-4">
          Profile Photo
        </h3>
        <AvatarUploader />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6  space-y-6">
          <div className="border-b border-[#F5F5F5] pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#111]">
              Personal Details
            </h3>
            <p className="text-xs text-[#6F6F6F]">
              Update your identity and contact options
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
            <div className="md:col-span-3 space-y-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-semibold text-[#111]"
              >
                Full Name
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={handleChange("name")}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <Label
                htmlFor="gender"
                className="text-xs font-semibold text-[#111]"
              >
                Gender
              </Label>
              <select
                value={form.gender}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    gender: e.target.value,
                  }))
                }
                className="border p-2 rounded w-full text-sm!"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <Label
                htmlFor="phone"
                className="text-xs font-semibold text-[#111]"
              >
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange("phone")}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <Label
                htmlFor="dob"
                className="text-xs font-semibold text-[#111]"
              >
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange("dateOfBirth")}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6  space-y-6">
          <div className="border-b border-[#F5F5F5] pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#111]">
              Shipping Address
            </h3>
            <p className="text-xs text-[#6F6F6F]">
              Your default delivery location for orders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
            <div className="md:col-span-6 space-y-1.5">
              <Label
                htmlFor="street"
                className="text-xs font-semibold text-[#111]"
              >
                Street Address
              </Label>
              <Input
                id="street"
                placeholder="Apartment, suite, unit, building, floor, etc."
                value={form.address.street}
                onChange={handleChange("address.street")}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <Label
                htmlFor="city"
                className="text-xs font-semibold text-[#111]"
              >
                City
              </Label>
              <Input
                id="city"
                value={form.address.city}
                onChange={handleChange("address.city")}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <Label
                htmlFor="state"
                className="text-xs font-semibold text-[#111]"
              >
                State / Province
              </Label>
              <Input
                id="state"
                value={form.address.state}
                onChange={handleChange("address.state")}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <Label
                htmlFor="postalCode"
                className="text-xs font-semibold text-[#111]"
              >
                Postal / ZIP Code
              </Label>
              <Input
                id="postalCode"
                value={form.address.postalCode}
                onChange={handleChange("address.postalCode")}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <Label
                htmlFor="country"
                className="text-xs font-semibold text-[#111]"
              >
                Country
              </Label>
              <Input
                id="country"
                value={form.address.country}
                onChange={handleChange("address.country")}
                className={inputClass}
              />
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6  space-y-6">
          <div className="border-b border-[#F5F5F5] pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#111]">
              Login & Security
            </h3>
            <p className="text-xs text-[#6F6F6F]">
              Manage your account credentials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-5 items-end">
            <div className="md:col-span-3 space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-[#111]"
              >
                Email Address
              </Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className={`${inputClass} bg-[#F9F9F9] text-[#6F6F6F] cursor-not-allowed`}
              />
            </div>
            <div className="md:col-span-3">
              <PasswordChangeDialog />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={!dirty || loading}
            className="rounded-full bg-[#111] hover:bg-[#ffb803] hover:text-[#111] hover:border-[#ffb803] border border-[#111] text-white font-bold uppercase tracking-wider px-10 h-12 text-xs transition-all  active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Saving Updates..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
