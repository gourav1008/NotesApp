import { useEffect, useContext } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";
import AuthContext from '../context/AuthContext';

const NotesPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      toast.error('Please login to view notes');
      return;
    }

    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        if (!res.data || !res.data._id) {
          throw new Error('Invalid note data received');
        }
        setNote(res.data);
      } catch (error) {
        console.error("Error fetching note:", error);
        
        if (error.response?.status === 401) {
          navigate('/login');
          toast.error('Please login to view notes');
        } else if (error.response?.status === 404) {
          navigate('/');
          toast.error('Note not found');
        } else if (error.response?.status === 429) {
          toast.error("Too many requests. Please try again later");
        } else {
          const errorMessage = error.response?.data?.error || 
                             error.response?.data?.message || 
                             'Failed to fetch note. Please try again.';
          toast.error(errorMessage);
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, isAuthenticated, navigate]);

  const handleDelete = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      toast.error('Please login to delete notes');
      return;
    }

    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await api.delete(`/notes/${id}`);
      if (response.status === 200) {
        toast.success("Note deleted successfully");
        navigate("/");
      } else {
        throw new Error('Failed to delete note');
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      
      if (error.response?.status === 401) {
        navigate('/login');
        toast.error('Please login to delete notes');
      } else if (error.response?.status === 429) {
        toast.error("Too many requests. Please try again later");
      } else {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Failed to delete note. Please try again.';
        toast.error(errorMessage);
      }
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      toast.error('Please login to update notes');
      return;
    }

    const trimmedTitle = note.title.trim();
    const trimmedContent = note.content.trim();

    if (!trimmedTitle || !trimmedContent) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    try {
      const response = await api.put(`/notes/${id}`, {
        title: trimmedTitle,
        content: trimmedContent
      });

      if (!response.data || !response.data._id) {
        throw new Error('Invalid response from server');
      }

      setNote(response.data);
      toast.success("Note updated successfully");
    } catch (error) {
      console.error("Error updating note:", error);
      
      if (error.response?.status === 401) {
        navigate('/login');
        toast.error('Please login to update notes');
      } else if (error.response?.status === 404) {
        navigate('/');
        toast.error('Note not found or you do not have permission to update it');
      } else if (error.response?.status === 429) {
        toast.error("Too many requests. Please try again later");
      } else {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Failed to update note. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/70 animate-pulse">Loading note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Link 
                to="/" 
                className="back-button"
              >
                <ArrowLeftIcon className="size-4" />
                <span>Back to Notes</span>
              </Link>
            </div>
            <button 
              onClick={handleDelete} 
              className="btn btn-error btn-outline btn-sm gap-2 w-fit"
            >
              <Trash2Icon className="size-4" />
              <span>Delete Note</span>
            </button>
          </div>

          <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="card-body p-4 sm:p-6 lg:p-8">
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base sm:text-lg">Title</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a descriptive title..."
                    className="input input-bordered w-full focus:input-primary transition-colors duration-200"
                    value={note.title}
                    onChange={(e) => setNote({ ...note, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base sm:text-lg">Content</span>
                  </label>
                  <textarea
                    placeholder="Write your note content here...

💡 Tips:
• Use bullet points for lists
• Add line breaks for better readability
• Edit and improve your content as needed"
                    className="form-textarea min-h-[16rem]"
                    value={note.content}
                    onChange={(e) => setNote({ ...note, content: e.target.value })}
                    required
                    rows={14}
                  />
                  <div className="flex justify-between items-center text-xs text-base-content/60 mt-1">
                    <span>Characters: {note.content.length}</span>
                    <span>Words: {note.content.trim() ? note.content.trim().split(/\s+/).length : 0}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Link 
                    to="/" 
                    className="btn-content-ghost"
                  >
                    Cancel
                  </Link>
                  <button 
                    type="submit" 
                    className="btn-content" 
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="loading loading-spinner loading-sm"></span>
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NotesPage;