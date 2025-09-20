import mongoose from "mongoose";

const adminNoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    richText: {
        type: Object,
        required: true,
        default: {}
    }
}, { timestamps: true });

// Index for faster queries
adminNoteSchema.index({ userId: 1, createdAt: -1 });

const AdminNote = mongoose.model("AdminNote", adminNoteSchema);
export default AdminNote;