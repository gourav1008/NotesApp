import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    actionType: {
        type: String,
        required: true,
        enum: ['DELETE_USER', 'BLOCK_USER', 'UNBLOCK_USER', 'ADD_NOTE', 'UPDATE_NOTE', 'DELETE_NOTE']
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    details: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const AdminLog = mongoose.model("AdminLog", adminLogSchema);
export default AdminLog;