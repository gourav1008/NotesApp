import Note from "../models/Notes.js";

export async function getNotes(req, res) {
    try {
        const notes = await Note.find().sort({ createdAt: -1 }); //Newest First
        res.status(200).json(notes);
    } catch (error) {
        console.error('Server Crashed', error)
        res.status(500).json({ message: "Internal Server Error!" });
    }
}
export async function getNoteById(req, res) {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: "Note not found" });
        res.status(200).json(note);
    } catch (error) {
        console.error('Server Crashed', error)
        res.status(500).json({ message: "Internal Server Error!" });
    }
}

export async function postNotes(req, res) {
    try {
        const { title, content } = req.body;
        const note = new Note({ title, content });
        const saveNotes = await note.save();
        res.status(201).json(saveNotes)
    } catch (error) {
        console.error('Server Crashed', error)
        res.status(500).json({ message: "Internal Server Error!" });
    }
}

export async function putNotes(req, res) {
    try {
        const { title, content } = req.body;
        const updatedNote = await Note.findByIdAndUpdate(req.params.id, { title, content }, { new: true, });
        if (!updatedNote) return res.status(404).json({ message: "Note not found" });
        res.status(201).json(updatedNote)

    } catch (error) {
        console.error('Server Crashed', error)
        res.status(500).json({ message: "Internal Server Error!" });
    }
}
export async function deleteNotes(req, res) {
    try {
        //  const { title, content }= req.body;
        const deletedNote = await Note.findByIdAndDelete(req.params.id)
        if (!deleteNotes) return res.status(404).json({ message: "Note not found" })
        res.status(200).json(deletedNote)

    } catch (error) {
        console.error('Server Crashed', error)
        res.status(500).json({ message: "Internal Server Error!" });
    }
}
