import React, { useEffect, useState } from 'react'
import RateLimiterUI from '../components/RateLimiterUi';
import toast from 'react-hot-toast'
import NoteCard from '../components/NoteCard';
import api from '../lib/axios'
import NoteNoteFound from '../components/NoteNoteFound'

import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!isAuthenticated) {
        setloading(false);
        navigate('/login');
        return;
      }

      try {
        const res = await api.get('/notes');
        console.log('Notes response:', res.data);
        
        if (Array.isArray(res.data)) {
          setNotes(res.data);
          setIsRateLimited(false);
        } else {
          console.error('Invalid notes data format:', res.data);
          toast.error('Error loading notes. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        
        if (error.response?.status === 401) {
          navigate('/login');
          toast.error('Please login to view notes');
        } else if (error.response?.status === 429) {
          setIsRateLimited(true);
          toast.error('Too many requests. Please try again later');
        } else {
          const errorMessage = error.response?.data?.error || 
                             error.response?.data?.message || 
                             'Failed to load notes. Please try again.';
          toast.error(errorMessage);
        }
        
        setNotes([]);
      } finally {
        setloading(false);
      }
    };

    fetchNotes();
  }, [isAuthenticated, navigate])
  return (
    <div className='min-h-screen bg-gradient-to-br from-base-200 to-base-300'>
      {isRateLimited && <RateLimiterUI />}
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-base-content mb-2">
            Your Notes
          </h1>
          <p className="text-base sm:text-lg text-base-content/70 max-w-2xl mx-auto">
            Organize your thoughts, ideas, and important information in one place
          </p>
        </div>

        {loading ? (
          <div className='flex justify-center items-center min-h-[40vh]'>
            <div className='flex flex-col items-center gap-4'>
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className='text-sm sm:text-base text-base-content/80 pulse-soft'>Loading your notes...</p>
            </div>
          </div>
        ) : (
          <>
            {notes.length === 0 && !isRateLimited && (
              <div className="fade-in">
                <NoteNoteFound />
              </div>
            )}
            
            {notes.length > 0 && !isRateLimited && (
              <>
                {/* Notes Stats */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base text-base-content/70">
                        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes Grid */}
                <div className='grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 fade-in-up'>
                  {notes.map((note, index) => (
                    <div 
                      key={note._id} 
                      className="hover-lift fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <NoteCard note={note} setNotes={setNotes} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default HomePage;
