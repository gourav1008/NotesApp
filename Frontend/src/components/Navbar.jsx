import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusIcon } from 'lucide-react'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'
import toast from 'react-hot-toast'

const Navbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success("Logged out successfully");
    navigate('/login');
  };

  return (
    <header className='bg-base-300 border-b border-base-content/10'>
      <div className='container mx-auto p-4'>
        <div className='flex justify-between items-center'>
          <Link to="/">
            <h1 className='text-3xl font-bold text-primary font-mono tracking-tighter'>NoteBookApp</h1>
          </Link>
          <div className='flex items-center gap-4'>
            <Link to="/create" className='btn btn-primary'>
              <PlusIcon className='size-5' />
              <span>Create Note</span>
            </Link>
            {user && (
              <div className='flex items-center gap-4'>
                <span className='text-xl'>Hello, {user.name}</span>
                {user.isAdmin && (
                  <Link to="/admin" className='btn btn-secondary'>
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className='btn btn-error'>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
