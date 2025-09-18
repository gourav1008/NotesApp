import Note from "../models/Notes.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

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
