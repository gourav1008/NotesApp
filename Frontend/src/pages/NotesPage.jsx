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
        <LoaderIcon className="animate-spin size-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Notes
            </Link>
            <button onClick={handleDelete} className="btn btn-error btn-outline">
              <Trash2Icon className="h-5 w-5" />
              Delete Note
            </button>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Note title"
                  className="input input-bordered"
                  value={note.title}
                  onChange={(e) => setNote({ ...note, title: e.target.value })}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Content</span>
                </label>
                <textarea
                  placeholder="Write your note here..."
                  className="textarea textarea-bordered h-32"
                  value={note.content}
                  onChange={(e) => setNote({ ...note, content: e.target.value })}
                />
              </div>

              <div className="card-actions justify-end">
                <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NotesPage;