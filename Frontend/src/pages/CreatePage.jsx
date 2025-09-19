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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link to='/' className='btn btn-ghost mb-6'>
            <ArrowLeftIcon className='size-5' />
            Back to Notes
          </Link>

          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className='card-title text-2xl mb-4'>Create New Note</h2>
              <form onSubmit={handleSubmit}>
                <div className='form-control mb-4'>
                  <label className='label'>
                    <span className='label-text'>Title</span>
                  </label>
                  <input type="text"
                    placeholder='Note Title'
                    className='input input-bordered'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className='form-control mb-4'>
                  <label className='label'>
                    <span className='label-text'>Content</span>
                  </label>
                  <textarea
                    placeholder='Write your note here...'
                    className='textarea textarea-bordered h-32'
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="card-actions justify-end ">
                  <button type='submit' className='btn btn-primary' disabled={loading}>
                    {loading ? 'Creating...' : 'Create Note'}
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
