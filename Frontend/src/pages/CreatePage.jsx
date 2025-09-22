import { ArrowLeftIcon, PlusIcon } from 'lucide-react'
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
    <div className='min-h-screen bg-gradient-to-br from-base-200 to-base-300'>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <Link 
            to='/' 
            className='btn btn-ghost btn-sm gap-2 hover:gap-3 transition-all duration-200 min-h-10 h-auto px-4 py-3 text-base sm:px-3 sm:py-2 order-2 sm:order-1'
          >
            <ArrowLeftIcon className='w-4 h-4' />
            <span>Back to Notes</span>
          </Link>
          <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-center sm:text-right order-1 sm:order-2'>
            Create New Note
          </h1>
        </div>

        {/* Form Card */}
        <div className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 border border-base-300/50 max-w-none">
          <div className="card-body p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div className='form-group'>
                <label className='label'>
                  <span className='label-text text-base font-medium'>Title</span>
                  <span className='label-text-alt text-xs opacity-60'>Required</span>
                </label>
                <input 
                  type="text"
                  placeholder='Enter a descriptive title...'
                  className='input input-bordered w-full text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100 transition-all duration-200'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Content Field */}
              <div className='form-group'>
                <label className='label'>
                  <span className='label-text text-base font-medium'>Content</span>
                  <span className='label-text-alt text-xs opacity-60'>Required</span>
                </label>
                <textarea
                  placeholder='Write your note content here...

💡 Tips:
• Use bullet points for lists
• Add line breaks for better readability
• Write as much or as little as you need'
                  className='textarea textarea-bordered w-full resize-none min-h-[200px] sm:min-h-[300px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100 transition-all duration-200'
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={12}
                />
                
                {/* Character/Word Count */}
                <div className="flex flex-wrap justify-between items-center gap-2 mt-2 text-xs text-base-content/60">
                  <div className="flex gap-4">
                    <span>Characters: <strong>{content.length}</strong></span>
                    <span>Words: <strong>{content.trim() ? content.trim().split(/\s+/).length : 0}</strong></span>
                  </div>
                  <div className="text-xs opacity-50">
                    {content.length > 0 && (
                      <span>✓ Content added</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-base-300/50">
                <Link 
                  to="/" 
                  className="btn btn-ghost w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </Link>
                <button 
                  type='submit' 
                  className='btn btn-primary w-full sm:w-auto gap-2 order-1 sm:order-2' 
                  disabled={loading || !title.trim() || !content.trim()}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4" />
                      Create Note
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePage
