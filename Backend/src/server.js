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
import { getCorsOptions } from './config/cors.js';

dotenv.config();
const port = process.env.PORT || 5001;
const fallbackPort = 5002;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors(getCorsOptions()));
app.use(express.json({ limit: '10mb' })); // Increased limit for file uploads
app.use(rateLimiter); // Apply rate limiter to all routes

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', routerRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from the React frontend app
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../Frontend/dist')));

  // Handle client-side routing
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next(); // Skip for API routes
    }
    res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'), err => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
}

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Connect DB and listen
dbconnect().then(() => {
  const server = app.listen(port, () => {
    console.log("✅ Server is running on port:", port);
    console.log("🌍 Environment:", process.env.NODE_ENV || 'development');
    console.log("🔗 Frontend URL:", process.env.FRONTEND_URL || 'Not set');
    console.log("📊 Database connected successfully");
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is in use, trying fallback port ${fallbackPort}...`);
      app.listen(fallbackPort, () => {
        console.log("✅ Server is running on fallback port:", fallbackPort);
      });
    } else {
      console.error("❌ Server error:", err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Process terminated');
    });
  });

  process.on('SIGINT', () => {
    console.log('🔄 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Process terminated');
    });
  });
}).catch((error) => {
  console.error("❌ Database connection failed:", error);
  process.exit(1);
});
