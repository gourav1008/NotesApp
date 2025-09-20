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

// Set production origin (deployed frontend URL) from .env or as a fallback
const localOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const prodOrigin = process.env.FRONTEND_URL || 'https://your-frontend-app.onrender.com'; // set your deployed frontend here

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [prodOrigin]
    : localOrigins;

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps/tools)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimiter);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', routerRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files (React built files)
app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// Client-side routing
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

// Error handlers
app.use(notFound);
app.use(errorHandler);

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
