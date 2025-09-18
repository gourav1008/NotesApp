import mongoose from 'mongoose';

// Validation middleware for registration
export const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  // Validate name
  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Please provide a valid email address");
  }

  // Validate password
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(", ")
    });
  }

  next();
};

// Validation middleware for login
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push("Email is required");
  }

  if (!password) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(", ")
    });
  }

  next();
};

// Validation middleware for notes
export const validateNote = (req, res, next) => {
  const { title, content } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (!content || content.trim().length === 0) {
    errors.push("Content is required");
  }

  if (title && title.length > 100) {
    errors.push("Title must be less than 100 characters");
  }

  if (content && content.length > 5000) {
    errors.push("Content must be less than 5000 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(", ")
    });
  }

  next();
};

// Validate MongoDB ObjectId
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid note ID"
    });
  }
  
  next();
};
