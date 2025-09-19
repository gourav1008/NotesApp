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
            className='card bg-base-100 hover:shadow-xl transition-all duration-300 border border-base-300 hover:border-primary rounded-xl overflow-hidden group'
        >
            <div className="card-body p-4 sm:p-5">
                <div className="flex flex-col gap-2">
                    <h3 className='card-title text-base sm:text-lg font-semibold text-base-content group-hover:text-primary transition-colors duration-200'>
                        {note.title || 'Untitled'}
                    </h3>
                    <p className='text-sm sm:text-base text-base-content/70 line-clamp-3 min-h-[3em]'>
                        {note.content || 'No content'}
                    </p>
                </div>
                <div className="card-actions justify-between items-center mt-4 pt-3 border-t border-base-200">
                    <span className='text-xs sm:text-sm text-base-content/60'>
                        {formatDate(new Date(note.createdAt))}
                    </span>
                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Link 
                            to={`/notes/${note._id}/edit`} 
                            onClick={(e) => e.stopPropagation()} 
                            className="btn btn-ghost btn-sm btn-square"
                            title="Edit note"
                        >
                            <PenSquareIcon className='size-4 sm:size-5'/>
                        </Link>
                        <button 
                            className='btn btn-ghost btn-sm btn-square text-error hover:bg-error/10' 
                            onClick={(e) => handleDelete(e, note._id)}
                            disabled={!isAuthenticated}
                            title="Delete note"
                        >
                            <Trash2Icon className='size-4 sm:size-5'/>
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default NoteCard
