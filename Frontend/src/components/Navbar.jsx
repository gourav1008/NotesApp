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
      <div className='container mx-auto px-4 py-3 sm:py-4'>
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0'>
          <Link to="/" className="w-full sm:w-auto text-center sm:text-left">
            <h1 className='text-2xl sm:text-3xl font-bold text-primary font-mono tracking-tighter'>NoteBookApp</h1>
          </Link>
          <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto'>
            <Link to="/create" className='btn btn-primary w-full sm:w-auto'>
              <PlusIcon className='size-4 sm:size-5' />
              <span className='hidden sm:inline'>Create Note</span>
              <span className='sm:hidden'>New</span>
            </Link>
            {user && (
              <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto'>
                <span className='text-lg sm:text-xl order-1 sm:order-none'>
                  Hello, {user.name.split(' ')[0]}
                </span>
                {user.isAdmin && (
                  <Link to="/admin" className='btn btn-secondary btn-sm sm:btn-md w-full sm:w-auto order-3 sm:order-none'>
                    Admin
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className='btn btn-error btn-sm sm:btn-md w-full sm:w-auto order-2 sm:order-none'
                >
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
