import dotenv from 'dotenv';
dotenv.config();

const allowedOrigins = [
    'http://localhost:5173',     // Vite dev server
    'http://localhost:3000',     // Common React port
    'https://notesapp-6rs9.onrender.com', // Your Render frontend URL
    process.env.FRONTEND_URL     // Production frontend URL from env
].filter(Boolean); // Remove any undefined/null values

const productionCorsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman)
        if (!origin) {
            return callback(null, true);
        }

        // Check if origin is in allowedOrigins
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS error: ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
};

const developmentCorsOptions = {
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400
};

export const getCorsOptions = () => {
    return process.env.NODE_ENV === 'production' ? productionCorsOptions : developmentCorsOptions;
};