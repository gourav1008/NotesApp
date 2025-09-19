import { ArrowLeftIcon } from 'lucide-react'
import React, { useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/axios';
import AuthContext from '../context/AuthContext';

const CreatePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      toast.error('Please login to create notes');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      toast.error('Please login to create notes');
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/notes', {
        title: trimmedTitle,
        content: trimmedContent
      });

      if (!response.data || !response.data._id) {
        throw new Error('Invalid response from server');
      }

      toast.success("Note created successfully!");
      navigate('/');
    } catch (error) {
      console.error("Error creating note:", error);
      
      if (error.response?.status === 401) {
        navigate('/login');
        toast.error('Please login to create notes');
      } else if (error.response?.status === 429) {
        toast.error("Slow down! You're creating notes too fast", {
          duration: 4000,
          icon: "💀"
        });
      } else {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Failed to create note. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }

  }
  return (
    <div className='min-h-screen bg-base-200'>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to='/' 
              className='btn btn-ghost btn-sm sm:btn-md gap-2 hover:gap-3 transition-all'
            >
              <ArrowLeftIcon className='size-4 sm:size-5' />
              <span className='hidden sm:inline'>Back to Notes</span>
              <span className='sm:hidden'>Back</span>
            </Link>
            <h2 className='text-lg sm:text-2xl font-bold text-base-content/90'>Create New Note</h2>
          </div>

          <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="card-body p-4 sm:p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text text-base sm:text-lg'>Title</span>
                  </label>
                  <input 
                    type="text"
                    placeholder='Enter a descriptive title...'
                    className='input input-bordered w-full focus:input-primary transition-colors duration-200'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text text-base sm:text-lg'>Content</span>
                  </label>
                  <textarea
                    placeholder='Write your note content here...'
                    className='textarea textarea-bordered min-h-[12rem] sm:min-h-[16rem] w-full focus:textarea-primary transition-colors duration-200 font-mono text-sm sm:text-base'
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>

                <div className="card-actions justify-end pt-4">
                  <button 
                    type='submit' 
                    className='btn btn-primary btn-sm sm:btn-md w-full sm:w-auto min-w-[8rem]' 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="loading loading-spinner loading-sm"></span>
                        Creating...
                      </span>
                    ) : (
                      'Create Note'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePage
