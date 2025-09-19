import React, { useEffect, useState } from 'react'
import RateLimiterUI from '../components/RateLimiterUi';
import toast from 'react-hot-toast'
import NoteCard from '../components/NoteCard';
import api from '../lib/axios'
import NoteNoteFound from '../components/NoteNoteFound'

const HomePage = () => {

  const [isRateLimited, setIsRateLimited] = useState(false)
  const [notes, setNotes] = useState([])
  const [loading, setloading] = useState(true)

  useEffect(() => {
    const fetchNotes = async () => {
      // Check for token first
      const token = localStorage.getItem('token');
      if (!token) {
        setloading(false);
        toast.error('Please login to view notes');
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
          toast.error('Error: Invalid data format received');
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        
        if (error.response?.status === 401) {
          // Clear invalid token
          localStorage.removeItem('token');
          toast.error('Session expired. Please login again');
        } else if (error.response?.status === 429) {
          setIsRateLimited(true);
          toast.error('Too many requests. Please try again later');
        } else {
          const errorMessage = error.response?.data?.error || 
                             error.response?.data?.message || 
                             error.message || 
                             'Failed to load notes';
          toast.error(errorMessage);
        }
        
        // Clear notes on error
        setNotes([]);
      } finally {
        setloading(false);
      }
    };

    fetchNotes();
  }, [])
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
