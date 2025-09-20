import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  const JWT_SECRET = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET;

  if (!JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not set!");
    console.error("Available environment variables:", Object.keys(process.env));
    throw new Error("JWT_SECRET environment variable is required");
  }

  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  console.log("register--------------------", name, email, password);

  try {
    const user = await User.create({
      name,
      email,
      password,
    });
    console.log("USER---------------------", user);
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.message.includes("JWT_SECRET")) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error. Please contact support."
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Login attempt for email:", email);

  if (!email || !password) {
    console.log("Login failed: Missing email or password");
    return res.status(400).json({ success: false, error: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log("Login failed: User not found for email:", email);
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await user.matchPasswords(password);
    console.log("Password match result for", email, ":", isMatch);

    if (!isMatch) {
      console.log("Login failed: Invalid password for email:", email);
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error.message.includes("JWT_SECRET")) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error. Please contact support."
      });
    }
    next(error);
  }
};

export const me = async (req, res) => {
  // req.user is set by protect middleware
  return res.status(200).json({ success: true, user: req.user });
};