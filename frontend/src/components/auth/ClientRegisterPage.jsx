"use client";
import PasswordStrengthMeter, {
  PASSWORD_REGEX,
} from "@/components/common/PasswordStrengthMeter";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";
import { BsGenderTrans } from "react-icons/bs";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";

export default function ClientRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!PASSWORD_REGEX.test(formData.password)) {
      newErrors.password =
        "Password must be 8+ chars with upper, lower, number & special char";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (
      formData.phone &&
      !/^\d{11}$/.test(formData.phone.replace(/[^0-9]/g, ""))
    ) {
      newErrors.phone = "Phone number is invalid";
    }
    if (
      formData.gender &&
      !["male", "female", "other"].includes(formData.gender)
    ) {
      newErrors.gender = "Please select a valid gender";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <>
      <div className="h-full flex flex-col items-center justify-center py-10 text-black bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className=" w-full max-w-3xl space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-[#ffb800] hover:text-[#ffb800]/80"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form className="" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-5 w-full">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md  ">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 !text-black border ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    } rounded-md  placeholder-gray-400 focus:outline-none focus:ring-[#ffb800] focus:border-[#ffb800]`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1 relative rounded-md ">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 !text-black pr-3 py-2 border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } rounded-md  placeholder-gray-400 focus:outline-none focus:ring-[#ffb800] focus:border-[#ffb800]`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number (optional)
                </label>
                <div className="mt-1 relative rounded-md ">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border !text-black ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    } rounded-md  placeholder-gray-400 focus:outline-none focus:ring-[#ffb800] focus:border-[#ffb800]`}
                    placeholder="(123) 456-7890"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gender (optional)
                </label>
                <div className="mt-1 relative rounded-md ">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BsGenderTrans className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`block w-full pl-8 pr-10 py-2 border !text-black ${
                      errors.gender ? "border-red-300" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-[#ffb800] focus:border-[#ffb800]`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative rounded-md ">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 !text-black pr-10 py-2 border ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    } rounded-md  placeholder-gray-400 focus:outline-none focus:ring-[#ffb800] focus:border-[#ffb800]`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <PasswordStrengthMeter password={formData.password} />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md ">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2 border !text-black ${
                      errors.confirmPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md  placeholder-gray-400 focus:outline-none focus:ring-[#ffb800] focus:border-[#ffb800]`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-black font-medium ${
                  loading
                    ? "bg-[#ffb800] cursor-not-allowed"
                    : "bg-[#ffb800] hover:[#ffb800]/80  focus:outline-none focus:ring-2 focus:ring-offset-2"
                }`}
              >
                {loading ? (
                  <span className="flex items-center cursor-not-allowed">
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 rounded-full border-2 border-[#111] border-t-transparent animate-spin" />
                    </div>
                    <span className="ml-2">Creating account...</span>
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={true}
                  className="w-full  cursor-not-allowed! items-center inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md  bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FaGoogle className="mr-2" size={16} />
                  Google
                </button>
                <button
                  disabled={true}
                  type="button"
                  className="w-full  cursor-not-allowed! inline-flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md  bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FaFacebook className="mr-2" size={18} />
                  Facebook
                </button>
              </div>
            </div>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          Running on a free-tier database — first request may be slow.
        </p>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Payra. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
