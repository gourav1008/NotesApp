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

// Set your deployed frontend Render URL in .env as FRONTEND_URL=https://your-frontend-app.onrender.com
const prodOrigin = process.env.FRONTEND_URL || 'https://your-frontend-app.onrender.com';
const localOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const allowedOrigins = process.env.NODE_ENV === "production"
  ? [prodOrigin]
  : localOrigins;

// Robust CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow tools without origin (e.g. curl/postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // critical for cookies/JWT
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Apply CORS globally
app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimiter);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', routerRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files (map to React build folder)
app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// Handle React client-side routing while skipping API
app.get('*', (req, res, next) => {
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

// Error handling middleware (must come after other app.use calls)
app.use(notFound);
app.use(errorHandler);

// Connect DB and listen
dbconnect().then(() => {
  const server = app.listen(port, () => {
    console.log("Server is running on port:", port);
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
