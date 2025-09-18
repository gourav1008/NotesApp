import express from "express";
import {
    getAllUsers,
    getAllUsersNotes,
    updateNoteByAdmin,
    deleteNoteByAdmin,
    sendMessageToUser,
    getMessagesForUser,
    getUserStats,
    getUserNotes,
    getUserDetails,
} from "../controller/adminController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Admin routes
router.get("/users", protect, admin, getAllUsers);
router.get("/notes", protect, admin, getAllUsersNotes);
router.put("/notes/:id", protect, admin, updateNoteByAdmin);
router.delete("/notes/:id", protect, admin, deleteNoteByAdmin);
router.post("/messages", protect, admin, sendMessageToUser);

// New admin routes for user statistics and details
router.get("/user-stats", protect, admin, getUserStats);
router.get("/user-notes/:userId", protect, admin, getUserNotes);
router.get("/user-details/:userId", protect, admin, getUserDetails);

// User route to get messages sent to them
router.get("/messages", protect, getMessagesForUser);

// In MongoDB shell or Compass
// db.users.updateOne(
//     { email: "your-email@example.com" },
//     { $set: { isAdmin: true } }
// )

export default router;
