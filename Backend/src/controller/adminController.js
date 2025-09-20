import Note from "../models/Notes.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import AdminNote from "../models/AdminNote.js";
import AdminLog from "../models/AdminLog.js";
import { logAdminAction, getAdminLogs } from "../utils/adminLogger.js";

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error("Server Crashed", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Get all users' notes (admin only)
export const getAllUsersNotes = async (req, res) => {
    try {
        const notes = await Note.find().populate("userId", "name email").sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        console.error("Server Crashed", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Update any note (admin only)
export const updateNoteByAdmin = async (req, res) => {
    try {
        const { title, content } = req.body;
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true }
        );
        if (!updatedNote) return res.status(404).json({ message: "Note not found" });
        res.status(200).json(updatedNote);
    } catch (error) {
        console.error("Server Crashed", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Delete any note (admin only)
export const deleteNoteByAdmin = async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        if (!deletedNote) return res.status(404).json({ message: "Note not found" });
        res.status(200).json(deletedNote);
    } catch (error) {
        console.error("Server Crashed", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Send message from admin to user
export const sendMessageToUser = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        if (!recipientId || !content) {
            return res.status(400).json({ message: "Recipient and content are required" });
        }
        const message = new Message({
            sender: req.user._id,
            recipient: recipientId,
            content,
        });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        console.error("Server Crashed", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Get messages sent to the authenticated user
export const getMessagesForUser = async (req, res) => {
    try {
        const messages = await Message.find({ recipient: req.user._id })
            .populate("sender", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Server Crashed", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Get user statistics (total notes and last update)
export const getUserStats = async (req, res) => {
    try {
        const users = await User.find();
        const stats = {};

        await Promise.all(users.map(async (user) => {
            const notes = await Note.find({ userId: user._id }).sort({ updatedAt: -1 });
            stats[user._id] = {
                totalNotes: notes.length,
                lastUpdate: notes.length > 0 ? notes[0].updatedAt : null
            };
        }));

        res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching user statistics:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Get notes for a specific user (admin only)
export const getUserNotes = async (req, res) => {
    try {
        const { userId } = req.params;
        const notes = await Note.find({ userId })
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error fetching user notes:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Get specific user details (admin only)
export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Delete user permanently (admin only)
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { confirmation } = req.body;
        
        if (!confirmation || confirmation !== 'DELETE') {
            return res.status(400).json({ 
                message: "Please provide confirmation by typing 'DELETE'" 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isAdmin) {
            return res.status(403).json({ 
                message: "Cannot delete admin users" 
            });
        }

        // Delete user's notes
        await Note.deleteMany({ userId });
        
        // Delete user's messages
        await Message.deleteMany({ 
            $or: [{ sender: userId }, { recipient: userId }] 
        });
        
        // Delete admin notes about this user
        await AdminNote.deleteMany({ userId });
        
        // Delete the user
        await User.findByIdAndDelete(userId);

        // Log the action
        await logAdminAction(
            req.user._id, 
            'DELETE_USER', 
            userId, 
            `Permanently deleted user: ${user.name} (${user.email})`
        );

        res.status(200).json({ 
            message: "User and all associated data deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Block user (admin only)
export const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isAdmin) {
            return res.status(403).json({ 
                message: "Cannot block admin users" 
            });
        }

        if (user.isBlocked) {
            return res.status(400).json({ 
                message: "User is already blocked" 
            });
        }

        user.isBlocked = true;
        user.blockedAt = new Date();
        user.blockedBy = req.user._id;
        user.lastModifiedBy = req.user._id;
        await user.save();

        // Log the action
        await logAdminAction(
            req.user._id, 
            'BLOCK_USER', 
            userId, 
            `Blocked user: ${user.name} (${user.email}). Reason: ${reason || 'No reason provided'}`
        );

        res.status(200).json({ 
            message: "User blocked successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isBlocked: user.isBlocked,
                blockedAt: user.blockedAt
            }
        });
    } catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Unblock user (admin only)
export const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isBlocked) {
            return res.status(400).json({ 
                message: "User is not blocked" 
            });
        }

        user.isBlocked = false;
        user.blockedAt = null;
        user.blockedBy = null;
        user.lastModifiedBy = req.user._id;
        await user.save();

        // Log the action
        await logAdminAction(
            req.user._id, 
            'UNBLOCK_USER', 
            userId, 
            `Unblocked user: ${user.name} (${user.email}). Reason: ${reason || 'No reason provided'}`
        );

        res.status(200).json({ 
            message: "User unblocked successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isBlocked: user.isBlocked
            }
        });
    } catch (error) {
        console.error("Error unblocking user:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Add admin note to user profile (admin only)
export const addAdminNote = async (req, res) => {
    try {
        const { userId } = req.params;
        const { content, richText } = req.body;

        if (!content) {
            return res.status(400).json({ 
                message: "Note content is required" 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const adminNote = new AdminNote({
            userId,
            adminId: req.user._id,
            content,
            richText: richText || {}
        });

        await adminNote.save();
        await adminNote.populate('adminId', 'name email');

        // Log the action
        await logAdminAction(
            req.user._id, 
            'ADD_NOTE', 
            userId, 
            `Added admin note for user: ${user.name} (${user.email})`
        );

        res.status(201).json({
            message: "Admin note added successfully",
            note: adminNote
        });
    } catch (error) {
        console.error("Error adding admin note:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Get admin notes for a user (admin only)
export const getAdminNotes = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const notes = await AdminNote.find({ userId })
            .populate('adminId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AdminNote.countDocuments({ userId });

        res.status(200).json({
            notes,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Error fetching admin notes:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Update admin note (admin only)
export const updateAdminNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { content, richText } = req.body;

        if (!content) {
            return res.status(400).json({ 
                message: "Note content is required" 
            });
        }

        const adminNote = await AdminNote.findById(noteId).populate('userId', 'name email');
        if (!adminNote) {
            return res.status(404).json({ message: "Admin note not found" });
        }

        adminNote.content = content;
        adminNote.richText = richText || {};
        await adminNote.save();
        await adminNote.populate('adminId', 'name email');

        // Log the action
        await logAdminAction(
            req.user._id, 
            'UPDATE_NOTE', 
            adminNote.userId._id, 
            `Updated admin note for user: ${adminNote.userId.name} (${adminNote.userId.email})`
        );

        res.status(200).json({
            message: "Admin note updated successfully",
            note: adminNote
        });
    } catch (error) {
        console.error("Error updating admin note:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Delete admin note (admin only)
export const deleteAdminNote = async (req, res) => {
    try {
        const { noteId } = req.params;

        const adminNote = await AdminNote.findById(noteId).populate('userId', 'name email');
        if (!adminNote) {
            return res.status(404).json({ message: "Admin note not found" });
        }

        const userId = adminNote.userId._id;
        const userName = adminNote.userId.name;
        const userEmail = adminNote.userId.email;

        await AdminNote.findByIdAndDelete(noteId);

        // Log the action
        await logAdminAction(
            req.user._id, 
            'DELETE_NOTE', 
            userId, 
            `Deleted admin note for user: ${userName} (${userEmail})`
        );

        res.status(200).json({
            message: "Admin note deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting admin note:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Get admin action logs (admin only)
export const getAdminActionLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const filters = {
            adminId: req.query.adminId,
            actionType: req.query.actionType,
            targetUserId: req.query.targetUserId,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });

        const result = await getAdminLogs(filters, page, limit);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching admin logs:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};
