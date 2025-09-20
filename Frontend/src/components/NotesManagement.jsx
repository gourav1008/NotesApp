import React, { useState, useEffect } from 'react';
import { PencilIcon, Trash2Icon, LoaderIcon } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const NotesManagement = ({ userId }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userInfo, setUserInfo] = useState(null);

    const fetchAllNotes = React.useCallback(async () => {
        try {
            const endpoint = userId ? `/admin/user-notes/${userId}` : '/admin/notes';
            const response = await api.get(endpoint);
            if (response.data && Array.isArray(response.data)) {
                setNotes(response.data);
            } else {
                console.error('Invalid notes data received:', response.data);
                setNotes([]);
                toast.error('Invalid notes data received');
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            setNotes([]);
            toast.error(error.response?.data?.message || 'Failed to fetch notes');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const fetchUserInfo = React.useCallback(async () => {
        try {
            const response = await api.get(`/admin/user-details/${userId}`);
            setUserInfo(response.data);
        } catch (error) {
            console.error('Error fetching user info:', error);
            toast.error('Failed to fetch user information');
        }
    }, [userId]);

    useEffect(() => {
        fetchAllNotes();
        if (userId) {
            fetchUserInfo();
        }
    }, [userId, fetchAllNotes, fetchUserInfo]);

    const handleEdit = (note) => {
        setSelectedNote(note);
        setEditMode(true);
    };

    const handleDelete = React.useCallback(async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;

        try {
            await api.delete(`/admin/notes/${noteId}`);
            toast.success('Note deleted successfully');
            fetchAllNotes(); // Refresh the notes list
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('Failed to delete note');
        }
    }, [fetchAllNotes]);

    const handleSave = React.useCallback(async (noteId, updatedData) => {
        try {
            await api.put(`/admin/notes/${noteId}`, updatedData);
            toast.success('Note updated successfully');
            setEditMode(false);
            setSelectedNote(null);
            fetchAllNotes(); // Refresh the notes list
        } catch (error) {
            console.error('Error updating note:', error);
            toast.error('Failed to update note');
        }
    }, [fetchAllNotes]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <LoaderIcon className="animate-spin size-10" />
            </div>
        );
    }

    const filteredNotes = notes.filter(note =>
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {editMode && selectedNote ? (
                <div className="card bg-base-200 shadow-lg">
                    <div className="card-body">
                        <h3 className="text-2xl font-bold mb-4">Edit Note</h3>
                        <div className="form-control">
                            <label className="label font-medium">Title</label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={selectedNote.title}
                                onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label font-medium">Content</label>
                            <textarea
                                className="textarea textarea-bordered h-32"
                                value={selectedNote.content}
                                onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                            />
                        </div>
                        <div className="card-actions justify-end mt-4">
                            <button
                                className="btn btn-ghost"
                                onClick={() => {
                                    setEditMode(false);
                                    setSelectedNote(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleSave(selectedNote._id, selectedNote)}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
                        <div className="form-control flex-1 w-full">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search notes by title, content, or author..."
                                    className="input input-bordered w-full pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        {userInfo && (
                            <div className="flex items-center gap-3 bg-base-200 px-4 py-2 rounded-lg">
                                <div className="avatar placeholder">
                                    <div className="bg-primary text-primary-content rounded-full w-10">
                                        <span className="text-lg">{userInfo.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium">{userInfo.name}</h4>
                                    <p className="text-sm opacity-70">{userInfo.email}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredNotes.map((note) => (
                            <div key={note._id} className="card bg-base-200 shadow-lg hover:shadow-xl transition-all h-full">
                                <div className="card-body">
                                    <h3 className="card-title font-bold text-lg mb-2">{note.title || 'Untitled'}</h3>
                                    <p className="text-base-content/70 line-clamp-4 flex-grow">{note.content || 'No content'}</p>

                                    <div className="divider my-2"></div>

                                    <div className="flex flex-col gap-3 text-sm opacity-70">
                                        {!userId && (
                                            <div className="flex items-center gap-2">
                                                <div className="avatar placeholder">
                                                    <div className="bg-neutral text-neutral-content rounded-full w-8">
                                                        <span>{note?.userId?.name?.charAt(0).toUpperCase() || '?'}</span>
                                                    </div>
                                                </div>
                                                <span>{note?.userId?.name || 'Unknown User'}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{new Date(note.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="card-actions justify-end mt-4 gap-2">
                                        <button
                                            className="btn btn-primary btn-outline btn-sm gap-1"
                                            onClick={() => handleEdit(note)}
                                            title="Edit note"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            className="btn btn-error btn-outline btn-sm gap-1"
                                            onClick={() => handleDelete(note._id)}
                                            title="Delete note"
                                        >
                                            <Trash2Icon className="h-4 w-4" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredNotes.length === 0 && (
                        <div className="text-center py-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-4 text-lg opacity-70">No notes found</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default NotesManagement;