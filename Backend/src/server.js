import express from "express"
import routerRoutes from './routes/notesRoutes.js'
import authRoutes from './routes/authRoutes.js'; 
import adminRoutes from './routes/adminRoutes.js';
import dbconnect from "./config/db.js";
import dotenv from 'dotenv'
import rateLimiter from "./middleware/rateLimiter.js";
import cors from 'cors';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config()
const port = process.env.PORT || 5001;
const fallbackPort = 5002; // Fallback port if 5001 is in use
const app = express()

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middleware
// Configure CORS based on environment variables
const corsOptions = {
    origin: function(origin, callback) {
        // Get allowed origins from environment variable
        const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:5173', 'http://localhost:5174']; // Default development origins

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`Origin ${origin} not allowed by CORS`);
            callback(new Error('Not allowed by CORS'));
        }
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

dbconnect().then(()=>{
    // Try to listen on the primary port
    const server = app.listen(port, () => {
        console.log("Server is running in port:", port);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            // If primary port is in use, try the fallback port
            console.log(`Port ${port} is in use, trying fallback port ${fallbackPort}...`);
            const fallbackServer = app.listen(fallbackPort, () => {
                console.log("Server is running in fallback port:", fallbackPort);
            });
        } else {
            console.error("Server error:", err);
        }
    });
})
