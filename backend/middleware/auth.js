const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getTokenFromRequest = (req) => {
  if (req.cookies && req.cookies.token) return req.cookies.token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  if (req.query && req.query.token) return req.query.token;
  if (req.body && req.body.token) return req.body.token;
  return null;
};

exports.protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res
      .status(401)
      .json({ message: "Not authorized, token verification failed" });
  }
};

exports.admin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized as admin" });
  }
  next();
};

exports.verifiedAccount = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (!req.user.isVerified) {
    return res
      .status(403)
      .json({ message: "Account not verified. Please verify your email." });
  }
  next();
};
