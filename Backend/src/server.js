import express from "express"
import routerRoutes from './routes/notesRoutes.js'
import authRoutes from './routes/authRoutes.js'; // Import auth routes
import adminRoutes from './routes/adminRoutes.js';
import dbconnect from "./config/db.js";
import dotenv from 'dotenv'
import rateLimiter from "./middleware/rateLimiter.js";
import cors from 'cors';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config()
const port = process.env.PORT || 5001;
const app = express()


//middleware
app.use(
    cors({
        origin: '*', // Allow all origins — use only in development
    })
);
app.use(express.json());
app.use(rateLimiter);

// Our simple custom middleware
// app.use((req, res, next)=>{
//     console.log(`The methode is ${req.method} from the url ${req.url}`);
//     next();
// })

app.use('/api/auth', authRoutes); // Add auth routes
app.use('/api/notes', routerRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

dbconnect().then(()=>{

    app.listen(port, () => {
        console.log("Server is running in port:",port);
        
    })
})
