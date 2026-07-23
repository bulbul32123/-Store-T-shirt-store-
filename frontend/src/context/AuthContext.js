//src/context/authContext.js
"use client";
import { API_URL } from "@/utils/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setUser(null);
          if (window.location.pathname !== "/auth/login") {
            toast.error("Session expired. Please login again.");
          }
        }

        return Promise.reject(error);
      },
    );
    return () => axios.interceptors.response.eject(responseInterceptor);
  }, [router]);
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/api/auth/me`);
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log("No active session found");
        setUser(null);
        if (error.response?.status !== 401) {
          console.error(
            "Auth check error:",
            error.response?.data?.message || error.message,
          );
        }
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post(
        `${API_URL}/api/auth/register`,
        userData,
      );

      if (data.success) {
        toast.success(
          data.message ||
            "Registration successful! Please check your email to verify your account.",
        );
        router.push("/auth/login");
        return data;
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, { requireAdmin = false } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      if (data.success && data.user) {
        if (requireAdmin && data.user.role !== "admin") {
          await axios.post(`${API_URL}/api/auth/logout`);
          // Clear token cookie
          document.cookie =
            "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
          setUser(null);
          const msg = "You are not authorized to access the admin panel";
          toast.error(msg);
          throw new Error(msg);
        }

        // SET TOKEN COOKIE FOR NEXT.JS MIDDLEWARE / PROXY
        if (data.token) {
          document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax;`;
        }

        setUser(data.user);
        toast.success(data.message || "Login successful!");

        if (requireAdmin) {
          router.push("/admin/dashboard");
        } else {
          const redirectUrl =
            sessionStorage.getItem("redirectAfterLogin") || "/";
          sessionStorage.removeItem("redirectAfterLogin");
          router.push(redirectUrl);
        }
        return data;
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      if (data.success && data.user) {
        if (data.user.role !== "admin") {
          await axios.post(`${API_URL}/api/auth/logout`);
          // Clear token cookie
          document.cookie =
            "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
          setUser(null);
          const msg = "This login is for admin accounts only";
          toast.error(msg);
          throw new Error(msg);
        }

        // SET TOKEN COOKIE FOR NEXT.JS MIDDLEWARE / PROXY
        if (data.token) {
          document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax;`;
        }

        setUser(data.user);
        toast.success("Login successful!");
        router.push("/admin/dashboard");
        return data;
      }
      throw new Error(data.message || "Login failed");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);

      // Clear Next.js token cookie
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      setUser(null);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/");
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.put(
        `${API_URL}/api/auth/update-profile`,
        userData,
      );

      if (data.success && data.user) {
        setUser(data.user);
        toast.success(data.message || "Profile updated successfully");
        return data;
      } else {
        throw new Error(data.message || "Profile update failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Update failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email,
      });

      if (data.success) {
        toast.success(
          data.message || "Password reset email sent. Please check your inbox.",
        );
        return data;
      } else {
        throw new Error(data.message || "Failed to send reset email");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send reset email";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.put(
        `${API_URL}/api/auth/reset-password?token=${token}`,
        {
          password,
        },
      );

      if (data.success) {
        toast.success(
          data.message ||
            "Password reset successful. You can now login with your new password.",
        );
        router.push("/auth/login");
        return data;
      } else {
        throw new Error(data.message || "Password reset failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Password reset failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(
        `${API_URL}/api/auth/verify-email?token=${token}`,
      );

      if (data.success) {
        toast.success(
          data.message || "Email verified successfully. You can now login.",
        );
        return data;
      } else {
        throw new Error(data.message || "Email verification failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Email verification failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const refreshUser = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/auth/me`);
      if (data.success && data.user) {
        setUser(data.user);
        return data.user;
      }
      return null;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      return null;
    }
  };
  const isAuthenticated = !!user;
  const hasRole = (role) => {
    return user?.role === role;
  };
  const isVerified = () => {
    return user?.isVerified === true;
  };
  const value = {
    user,
    loading,
    error,
    adminLogin,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    verifyEmail,

    refreshUser,

    hasRole,
    isVerified,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
