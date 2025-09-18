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
const app = express()

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middleware
app.use(
    cors({
        origin: '*', // Allow all origins — use only in development
    })
);
app.use(express.json());
app.use(rateLimiter);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', routerRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// Handle client-side routing - always return the main index.html
app.get('*', (req, res) => {
    // Don't handle /api routes here
    if (!req.url.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../Frontend','dist', 'index.html'));
    } else {
        next();
    }
});

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

dbconnect().then(()=>{

    app.listen(port, () => {
        console.log("Server is running in port:",port);
        
    })
})
