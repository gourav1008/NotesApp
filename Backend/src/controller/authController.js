import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  const JWT_SECRET = process.env.JWT_SECRET || "anirban";
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
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await user.matchPasswords(password);

    if (!isMatch) {
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
    next(error);
  }
};

export const me = async (req, res) => {
  // req.user is set by protect middleware
  return res.status(200).json({ success: true, user: req.user });
};