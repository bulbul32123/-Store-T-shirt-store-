const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { notifyAdmins } = require("../utils/notify");
const User = require("../models/User");
const { PASSWORD_REGEX, PASSWORD_MESSAGE } = require("../utils/passwordPolicy");
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    // Cross-site cookies (Vercel <-> Render) REQUIRE sameSite: 'none' and secure: true
    secure: true,
    sameSite: 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };

  res.cookie("token", token, cookieOptions);
};

const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
    secure: true,
    sameSite: 'None',
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, gender } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields",
      });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res
        .status(400)
        .json({ success: false, message: PASSWORD_MESSAGE });
    }
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const verificationToken = uuidv4();
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim() || "",
      gender: gender || "",
      verificationToken,
      verificationTokenExpires: Date.now() + 60 * 60 * 1000,
    });

    notifyAdmins({
      type: "new_customer",
      title: "New Customer",
      message: `${user.name} just signed up`,
      link: `/admin/customers?id=${user._id}`,
    });
    res.status(201).json({
      success: true,
      message: "Registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = generateToken(user._id, user.role);
    setTokenCookie(res, token);
    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({
      success: true,
      message: "Login successful",
      user: userPayload,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

exports.logout = (req, res) => {
  try {
    clearTokenCookie(res);
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    res.json({
      success: true,
      message: "Password reset link generated successfully",
      resetUrl,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during password reset request",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res
        .status(400)
        .json({ success: false, message: PASSWORD_MESSAGE });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching user data",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      oldPassword,
      gender,
      phoneNumber,
      dateOfBirth,
      profilePicture,
      address,
    } = req.body;
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (password) {
      if (!oldPassword) {
        return res.status(400).json({
          success: false,
          message: "Please provide your current password to set a new one.",
        });
      }

      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect current password. Please try again.",
        });
      }
      if (!PASSWORD_REGEX.test(password)) {
        return res
          .status(400)
          .json({ success: false, message: PASSWORD_MESSAGE });
      }

      user.password = password;
    }

    if (name) user.name = name.trim();
    if (gender) user.gender = gender;
    if (phoneNumber) user.phoneNumber = phoneNumber.trim();
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (profilePicture) user.profilePicture = profilePicture;
    if (address) user.address = { ...user.address?.toObject?.(), ...address };

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }

      user.email = email.toLowerCase().trim();
      user.verificationToken = require("uuid").v4();
      user.verificationTokenExpires = Date.now() + 60 * 60 * 1000;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during profile update",
    });
  }
};
