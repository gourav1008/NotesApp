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
    deleteUser,
    blockUser,
    unblockUser,
    addAdminNote,
    getAdminNotes,
    updateAdminNote,
    deleteAdminNote,
    getAdminActionLogs,
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

// User management routes
router.delete("/users/:userId", protect, admin, deleteUser);
router.patch("/users/:userId/block", protect, admin, blockUser);
router.patch("/users/:userId/unblock", protect, admin, unblockUser);

// Admin notes routes
router.post("/users/:userId/notes", protect, admin, addAdminNote);
router.get("/users/:userId/notes", protect, admin, getAdminNotes);
router.put("/admin-notes/:noteId", protect, admin, updateAdminNote);
router.delete("/admin-notes/:noteId", protect, admin, deleteAdminNote);

// Admin logs route
router.get("/logs", protect, admin, getAdminActionLogs);

// In MongoDB shell or Compass
// db.users.updateOne(
//     { email: "your-email@example.com" },
//     { $set: { isAdmin: true } }
// )

export default router;
