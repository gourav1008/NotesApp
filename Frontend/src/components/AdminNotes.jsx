import React, { useState, useEffect } from 'react';
import { 
    PlusIcon, 
    EditIcon, 
    TrashIcon, 
    SaveIcon, 
    XIcon,
    ClockIcon,
    UserIcon,
    StickyNoteIcon
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import ConfirmationDialog from './ConfirmationDialog';

const AdminNotes = ({ userId, userName }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingNote, setEditingNote] = useState(null);
    const [newNote, setNewNote] = useState({ content: '', richText: {} });
    const [showAddForm, setShowAddForm] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, note: null });
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchAdminNotes();
        }
    }, [userId]);

    const fetchAdminNotes = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/users/${userId}/notes`);
            setNotes(response.data.notes || []);
        } catch (error) {
            console.error('Error fetching admin notes:', error);
            toast.error('Failed to fetch admin notes');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.content.trim()) {
            toast.error('Note content is required');
            return;
        }

        setActionLoading('add');
        try {
            const response = await api.post(`/admin/users/${userId}/notes`, newNote);
            setNotes([response.data.note, ...notes]);
            setNewNote({ content: '', richText: {} });
            setShowAddForm(false);
            toast.success('Admin note added successfully');
        } catch (error) {
            console.error('Error adding admin note:', error);
            toast.error(error.response?.data?.message || 'Failed to add admin note');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateNote = async (noteId, updatedData) => {
        setActionLoading(noteId);
        try {
            const response = await api.put(`/admin/admin-notes/${noteId}`, updatedData);
            setNotes(notes.map(note => 
                note._id === noteId ? response.data.note : note
            ));
            setEditingNote(null);
            toast.success('Admin note updated successfully');
        } catch (error) {
            console.error('Error updating admin note:', error);
            toast.error(error.response?.data?.message || 'Failed to update admin note');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteNote = async (noteId) => {
        setActionLoading(noteId);
        try {
            await api.delete(`/admin/admin-notes/${noteId}`);
            setNotes(notes.filter(note => note._id !== noteId));
            toast.success('Admin note deleted successfully');
        } catch (error) {
            console.error('Error deleting admin note:', error);
            toast.error(error.response?.data?.message || 'Failed to delete admin note');
        } finally {
            setActionLoading(null);
            setDeleteDialog({ isOpen: false, note: null });
        }
    };

    const startEditing = (note) => {
        setEditingNote({
            ...note,
            content: note.content,
            richText: note.richText || {}
        });
    };

    const cancelEditing = () => {
        setEditingNote(null);
    };

    const saveEdit = () => {
        if (!editingNote.content.trim()) {
            toast.error('Note content is required');
            return;
        }
        handleUpdateNote(editingNote._id, {
            content: editingNote.content,
            richText: editingNote.richText
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <StickyNoteIcon className="h-6 w-6" />
                    <h3 className="text-xl font-bold">Admin Notes</h3>
                    <div className="badge badge-neutral">{notes.length}</div>
                </div>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    <PlusIcon className="h-4 w-4" />
                    Add Note
                </button>
            </div>

            {userName && (
                <div className="alert alert-info">
                    <UserIcon className="h-5 w-5" />
                    <span>Managing admin notes for: <strong>{userName}</strong></span>
                </div>
            )}

            {/* Add New Note Form */}
            {showAddForm && (
                <div className="card bg-base-100 shadow-sm border-2 border-primary">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">Add New Admin Note</h4>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewNote({ content: '', richText: {} });
                                }}
                            >
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>
                        
                        <div className="form-control">
                            <textarea
                                className="textarea textarea-bordered h-32"
                                placeholder="Enter admin note content..."
                                value={newNote.content}
                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            />
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewNote({ content: '', richText: {} });
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className={`btn btn-primary btn-sm ${actionLoading === 'add' ? 'loading' : ''}`}
                                onClick={handleAddNote}
                                disabled={!newNote.content.trim() || actionLoading === 'add'}
                            >
                                {actionLoading !== 'add' && <SaveIcon className="h-4 w-4" />}
                                Add Note
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes List */}
            <div className="space-y-4">
                {notes.map(note => (
                    <div key={note._id} className="card bg-base-100 shadow-sm">
                        <div className="card-body p-4">
                            {editingNote && editingNote._id === note._id ? (
                                // Edit Mode
                                <div className="space-y-3">
                                    <div className="form-control">
                                        <textarea
                                            className="textarea textarea-bordered h-32"
                                            value={editingNote.content}
                                            onChange={(e) => setEditingNote({
                                                ...editingNote,
                                                content: e.target.value
                                            })}
                                        />
                                    </div>
                                    
                                    <div className="flex justify-end gap-2">
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={cancelEditing}
                                            disabled={actionLoading === note._id}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className={`btn btn-primary btn-sm ${actionLoading === note._id ? 'loading' : ''}`}
                                            onClick={saveEdit}
                                            disabled={!editingNote.content.trim() || actionLoading === note._id}
                                        >
                                            {actionLoading !== note._id && <SaveIcon className="h-4 w-4" />}
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2 text-sm opacity-70">
                                            <UserIcon className="h-4 w-4" />
                                            <span>By {note.adminId?.name || 'Unknown Admin'}</span>
                                            <ClockIcon className="h-4 w-4 ml-2" />
                                            <span>{new Date(note.createdAt).toLocaleString()}</span>
                                            {note.updatedAt !== note.createdAt && (
                                                <span className="text-warning">(edited)</span>
                                            )}
                                        </div>
                                        
                                        <div className="flex gap-1">
                                            <button
                                                className="btn btn-ghost btn-xs"
                                                onClick={() => startEditing(note)}
                                                disabled={actionLoading === note._id}
                                                title="Edit note"
                                            >
                                                <EditIcon className="h-3 w-3" />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-xs text-error"
                                                onClick={() => setDeleteDialog({ isOpen: true, note })}
                                                disabled={actionLoading === note._id}
                                                title="Delete note"
                                            >
                                                <TrashIcon className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="prose prose-sm max-w-none">
                                        <p className="whitespace-pre-wrap">{note.content}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {notes.length === 0 && (
                <div className="text-center py-8">
                    <StickyNoteIcon className="mx-auto h-12 w-12 opacity-30" />
                    <p className="mt-4 text-lg">No admin notes yet</p>
                    <p className="text-sm opacity-70">Add a note to keep track of important information about this user</p>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, note: null })}
                onConfirm={() => handleDeleteNote(deleteDialog.note._id)}
                title="Delete Admin Note"
                message="Are you sure you want to delete this admin note? This action cannot be undone."
                confirmText="Delete Note"
                type="danger"
                isLoading={actionLoading !== null}
            />
        </div>
    );
};

export default AdminNotes;
