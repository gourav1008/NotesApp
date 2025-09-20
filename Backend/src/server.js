import express from "express";
import routerRoutes from './routes/notesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dbconnect from "./config/db.js";
import dotenv from 'dotenv';
import rateLimiter from "./middleware/rateLimiter.js";
import cors from 'cors';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const port = process.env.PORT || 5001;
const fallbackPort = 5002;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS Configuration - Fixed for production deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Get allowed origins from environment variable or use defaults
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim())
      : process.env.NODE_ENV === "production"
        ? [
            process.env.FRONTEND_URL, // Your deployed frontend URL
            process.env.RENDER_EXTERNAL_URL, // Render's external URL
            process.env.VITE_API_URL, // Sometimes needed for Vite
            // Common Render patterns
            /^https:\/\/.*\.onrender\.com$/,
            /^https:\/\/.*-.*\.onrender\.com$/,
          ].filter(Boolean)
        : [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174'
          ];

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    // Log the rejected origin for debugging
    console.log(`CORS rejected origin: ${origin}`);
    console.log(`Allowed origins: ${allowedOrigins.map(o => typeof o === 'string' ? o : o.toString()).join(', ')}`);

    // For development, be more permissive
    if (process.env.NODE_ENV !== "production") {
      console.log('Development mode: Allowing origin for debugging');
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Required for cookies and authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Increased limit for file uploads
app.use(rateLimiter);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', routerRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// Handle client-side routing - always return the main index.html
app.get('*', (req, res, next) => {
  // Don't handle /api routes here
  if (!req.url.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'), (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error loading application');
      }
    });
  } else {
    next();
  }
});

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Connect DB and listen
dbconnect().then(() => {
  const server = app.listen(port, () => {
    console.log("Server is running on port:", port);
    console.log("Environment:", process.env.NODE_ENV || 'development');
    console.log("Frontend URL:", process.env.FRONTEND_URL || 'Not set');
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying fallback port ${fallbackPort}...`);
      app.listen(fallbackPort, () => {
        console.log("Server is running on fallback port:", fallbackPort);
      });
    } else {
      console.error("Server error:", err);
    }
  });
});
