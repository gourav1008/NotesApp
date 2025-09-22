import React, { useState, useEffect,useCallback } from "react";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  SaveIcon,
  XIcon,
  ClockIcon,
  UserIcon,
  StickyNoteIcon,
  AlertCircleIcon,
} from "lucide-react";
import { format } from "date-fns";
import api from "../lib/axios";
import toast from "react-hot-toast";
import ConfirmationDialog from "./ConfirmationDialog";

const AdminNotes = ({ userId, userName }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, note: null });
  const [actionLoading, setActionLoading] = useState(null);
  const [editContent, setEditContent] = useState("");

  const fetchAdminNotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${userId}/notes`);
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error("Error fetching admin notes:", error);
      toast.error("Failed to fetch admin notes");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAdminNotes();
    }
  }, [userId, fetchAdminNotes]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) {
      toast.error("Note content is required");
      return;
    }
    setActionLoading("add");
    try {
      const response = await api.post(`/admin/users/${userId}/notes`, {
        content: newNote,
        richText: {},
      });
      setNotes([response.data.note, ...notes]);
      setNewNote("");
      setShowAddForm(false);
      toast.success("Admin note added successfully");
    } catch (error) {
      console.error("Error adding admin note:", error);
      toast.error(error.response?.data?.message || "Failed to add admin note");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateNote = async (noteId, updatedData) => {
    setActionLoading(noteId);
    try {
      const response = await api.put(`/admin/admin-notes/${noteId}`, updatedData);
      setNotes(notes.map((note) => (note._id === noteId ? response.data.note : note)));
      setEditingNote(null);
      toast.success("Admin note updated successfully");
    } catch (error) {
      console.error("Error updating admin note:", error);
      toast.error(error.response?.data?.message || "Failed to update admin note");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteNote = async (noteId) => {
    setActionLoading(noteId);
    try {
      await api.delete(`/admin/admin-notes/${noteId}`);
      setNotes(notes.filter((note) => note._id !== noteId));
      toast.success("Admin note deleted successfully");
    } catch (error) {
      console.error("Error deleting admin note:", error);
      toast.error(error.response?.data?.message || "Failed to delete admin note");
    } finally {
      setActionLoading(null);
      setDeleteDialog({ isOpen: false, note: null });
    }
  };

  const startEditing = (note) => {
    setEditingNote(note._id);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditContent("");
  };

  const handleSubmitEdit = (e, noteId) => {
    e.preventDefault();
    if (!editContent.trim()) {
      toast.error("Note content is required");
      return;
    }
    handleUpdateNote(noteId, { content: editContent, richText: {} });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StickyNoteIcon className="w-6 h-6" />
          <h3 className="text-xl font-bold">Admin Notes</h3>
          <div className="badge badge-neutral">{notes.length}</div>
        </div>
        <button
          className={`btn btn-primary btn-sm gap-2 ${loading ? "loading" : ""}`}
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading}
        >
          {!loading && <PlusIcon className="w-4 h-4" />}
          {showAddForm ? "Cancel" : "Add Note"}
        </button>
      </div>

      {userName && (
        <div className="alert alert-info">
          <UserIcon className="h-5 w-5" />
          <span>
            Managing admin notes for: <strong>{userName}</strong>
          </span>
        </div>
      )}

      {/* Add Note Form */}
      {showAddForm && (
        <div className="card bg-base-100 shadow-sm border">
          <div className="card-body">
            <form onSubmit={handleAddNote} className="space-y-4">
              <textarea
                className="textarea textarea-bordered w-full min-h-[120px]"
                placeholder="Enter admin note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewNote("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary gap-2"
                  disabled={!newNote.trim() || actionLoading === "add"}
                >
                  <PlusIcon className="w-4 h-4" /> Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircleIcon className="w-12 h-12 mx-auto text-base-content/30" />
          <h3 className="mt-4 text-lg font-semibold">No Admin Notes</h3>
          <p className="text-base-content/70">Add a note for this user</p>
        </div>
      ) : (
        notes.map((note) => (
          <div
            key={note._id}
            className="card bg-base-100 shadow-sm border p-4 sm:p-6"
          >
            {editingNote === note._id ? (
              <form onSubmit={(e) => handleSubmitEdit(e, note._id)} className="space-y-4">
                <textarea
                  className="textarea textarea-bordered w-full min-h-[120px]"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn btn-ghost" onClick={cancelEditing}>
                    <XIcon className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary gap-2"
                    disabled={!editContent.trim() || actionLoading === note._id}
                  >
                    <SaveIcon className="w-4 h-4" /> Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="whitespace-pre-wrap break-words">{note.content}</p>
                  <div className="flex items-center gap-2 text-sm text-base-content/70 mt-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>{format(new Date(note.createdAt), "MMM d, yyyy h:mm a")}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => startEditing(note)}
                    disabled={actionLoading === note._id}
                  >
                    <EditIcon className="w-4 h-4" /> Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => setDeleteDialog({ isOpen: true, note })}
                    disabled={actionLoading === note._id}
                  >
                    <TrashIcon className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, note: null })}
        onConfirm={() => deleteDialog.note && handleDeleteNote(deleteDialog.note._id)}
        title="Delete Admin Note"
        message="Are you sure you want to delete this admin note? This action cannot be undone."
        confirmText="Delete"
        confirmButtonClass="btn-error"
        confirmIcon={<TrashIcon className="w-4 h-4" />}
        isLoading={actionLoading === deleteDialog.note?._id}
      />
    </div>
  );
};

export default AdminNotes;
