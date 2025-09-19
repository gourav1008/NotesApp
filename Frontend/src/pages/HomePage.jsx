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
      <div className="max-w-7xl mx-auto p-4 mt-6">
        {loading && <div className='text-center text-primary py-10'>Loading notes...</div>}
        {notes.length === 0 && !isRateLimited && <NoteNoteFound />}
        {notes.length > 0 && !isRateLimited && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} setNotes={setNotes} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage;
