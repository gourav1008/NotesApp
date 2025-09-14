import express from "express"
import routerRoutes from './routes/notesRoutes.js'
import dbconnect from "./config/db.js";
import dotenv from 'dotenv'
import rateLimiter from "./middleware/rateLimiter.js";
import cors from 'cors';
import path from 'path';

dotenv.config()
const port = process.env.PORT || 5001;
const __dirname = path.resolve();
const app = express()


//middleware
if (process.env.NODE_ENV !== "production") {
    app.use(
        cors({
            origin: 'http://localhost:5173',
        })
    );
}
app.use(express.json());
app.use(rateLimiter);

// Our simple custom middleware
// app.use((req, res, next)=>{
//     console.log(`The methode is ${req.method} from the url ${req.url}`);
//     next();
// })

app.use('/api/notes', routerRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../Frontend/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
    });
}

dbconnect().then(() => {

    app.listen(port, () => {
        console.log("Server is running in port:", port);

    })
})