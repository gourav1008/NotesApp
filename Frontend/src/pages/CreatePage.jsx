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
    <div className='min-h-screen'>
      <div className="container section-padding">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to='/' 
              className='back-button'
            >
              <ArrowLeftIcon className='size-4' />
              <span>Back to Notes</span>
            </Link>
            <h2 className='heading-responsive'>Create New Note</h2>
          </div>

          <div className="auth-card">
            <div className="card-body">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className='form-group'>
                  <label className='form-label'>
                    <span>Title</span>
                  </label>
                  <input 
                    type="text"
                    placeholder='Enter a descriptive title...'
                    className='form-input'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className='form-group'>
                  <label className='form-label'>
                    <span>Content</span>
                  </label>
                  <textarea
                    placeholder='Write your note content here...

💡 Tips:
• Use bullet points for lists
• Add line breaks for better readability
• Write as much or as little as you need'
                    className='form-textarea'
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={12}
                  />
                  <div className="flex justify-between items-center text-xs text-base-content/60 mt-1">
                    <span>Characters: {content.length}</span>
                    <span>Words: {content.trim() ? content.trim().split(/\s+/).length : 0}</span>
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
                    type='submit' 
                    className='btn-content' 
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
