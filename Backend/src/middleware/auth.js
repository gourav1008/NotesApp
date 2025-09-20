import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Check if JWT_SECRET is set
      const JWT_SECRET = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET;
      if (!JWT_SECRET) {
        console.error("JWT_SECRET environment variable is not set!");
        return res.status(500).json({ success: false, error: "Server configuration error" });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("Token decoded successfully for user:", decoded.id);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.log("User not found for decoded token ID:", decoded.id);
        return res.status(401).json({ success: false, error: "User not found" });
      }

      // Check if user is blocked
      if (req.user.isBlocked) {
        console.log("Blocked user attempted access:", req.user.email);
        return res.status(403).json({ 
          success: false, 
          error: "Account has been blocked. Please contact support.",
          isBlocked: true
        });
      }

      console.log("User authenticated successfully:", req.user.email);
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      console.error("Token was:", token ? "present" : "not present");
      return res.status(401).json({ success: false, error: "Not authorized, token failed" });
    }
  } else {
    console.log("No authorization header found");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    return res.status(401).json({ success: false, error: "Not authorized, no token" });
  }
};

// Middleware to check if user is admin
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ success: false, error: "Admin access required" });
  }
};

// Middleware to check if user is not blocked (for regular users)
export const notBlocked = (req, res, next) => {
  if (req.user && req.user.isBlocked) {
    return res.status(403).json({ 
      success: false, 
      error: "Account has been blocked. Please contact support.",
      isBlocked: true
    });
  }
  next();
};
