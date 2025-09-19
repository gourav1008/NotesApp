import { PenSquareIcon, Trash2Icon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDate } from '../lib/utils'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

const NoteCard = ({note, setNotes}) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);

    const handleDelete = async (e, id) => {
        e.preventDefault(); // Prevent navigation

        if (!isAuthenticated) {
            navigate('/login');
            toast.error('Please login to delete notes');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this note?')) return;

        try {
            const response = await api.delete(`/notes/${id}`);
            
            if (response.status === 200) {
                setNotes((prev) => prev.filter(note => note._id !== id));
                toast.success('Note deleted successfully');
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

    const handleCardClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault();
            navigate('/login');
            toast.error('Please login to view note details');
            return;
        }
    };

    return (
        <Link 
            to={`/notes/${note._id}`} 
            onClick={handleCardClick}
            className='card bg-base-100 hover:shadow-lg transition-all duration-200 border-t-4 border-solid border-[#00FF9D] px-5 py-2'
        >
            <div className="card-body">
                <h3 className='card-title text-base-content'>{note.title || 'Untitled'}</h3>
                <p className='text-base-content/70 line-clamp-3'>{note.content || 'No content'}</p>
                <div className="card-actions justify-between items-center mt-4">
                    <span className='text-sm text-base-content/60'>{formatDate(new Date(note.createdAt))}</span>
                    <div className="flex items-center gap-1">
                        <PenSquareIcon className='size-4'/>
                        <button 
                            className='btn btn-ghost btn-xs text-error' 
                            onClick={(e) => handleDelete(e, note._id)}
                            disabled={!isAuthenticated}
                        >
                            <Trash2Icon className='size-4'/>
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default NoteCard
