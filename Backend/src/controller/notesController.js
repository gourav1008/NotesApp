import Note from "../models/Notes.js";

// Rate limiting setup
const rateLimit = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
};

// Get all notes
export const getNotes = async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        console.error("Error in getNotes:", error);
        res.status(500).json({ message: "Failed to fetch notes" });
    }
};

// Get note by ID
export async function getNoteById(req, res) {
    try {
        const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
        if (!note) return res.status(404).json({ message: "Note not found" });
        res.status(200).json(note);
    } catch (error) {
        console.error('Server Crashed', error)
        res.status(500).json({ message: "Internal Server Error!" });
    }
}

// Create a new note
export const postNotes = async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = new Note({ title, content, userId: req.user.id });
        const saveNotes = await note.save();
        res.status(201).json(saveNotes)
    } catch (error) {
        console.error('Server Crashed', error)
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// Update a note
export const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findByIdAndUpdate(id, req.body, { new: true });
        if (!note) return res.status(404).json({ message: "Note not found" });
        res.json(note);
    } catch (error) {
        console.error("Error in updateNote:", error);
        res.status(500).json({ message: "Failed to update note" });
    }
};

// Delete a note
export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findByIdAndDelete(id);
        if (!note) return res.status(404).json({ message: "Note not found" });
        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Error in deleteNote:", error);
        res.status(500).json({ message: "Failed to delete note" });
    }
};
