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
    <div className='min-h-screen'>
      {isRateLimited && <RateLimiterUI />}
      <div className="container section-padding">
        {loading ? (
          <div className='flex justify-center items-center min-h-[50vh]'>
            <div className='flex flex-col items-center gap-3'>
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className='text-responsive text-base-content/80 animate-pulse'>Loading your notes...</p>
            </div>
          </div>
        ) : (
          <>
            {notes.length === 0 && !isRateLimited && <NoteNoteFound />}
            {notes.length > 0 && !isRateLimited && (
              <div className='card-grid'>
                {notes.map((note) => (
                  <div key={note._id} className="hover-scale">
                    <NoteCard note={note} setNotes={setNotes} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default HomePage;
