import User from "./src/models/User.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/notes-app");
        console.log("Connected to MongoDB");

        // Admin user details
        const adminUser = {
            name: "Admin User",
            email: "admin@example.com",
            password: "admin123",
            isAdmin: true
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminUser.email });
        if (existingAdmin) {
            console.log("Admin user already exists");
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create(adminUser);
        console.log("Admin user created successfully:");
        console.log("Email:", admin.email);
        console.log("Password: admin123");

    } catch (error) {
        console.error("Error creating admin user:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createAdmin();