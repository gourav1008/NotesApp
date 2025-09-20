import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusIcon, LogOut } from 'lucide-react'
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
      <nav className='container section-padding'>
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0'>
          <Link to="/" className="nav-link w-full sm:w-auto text-center sm:text-left">
            <h1 className='heading-responsive font-mono text-primary tracking-tighter'>NoteBookApp</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              to="/create" 
              className='btn btn-secondary btn-sm sm:btn-md hover-scale'
            >
              <PlusIcon className='size-4 sm:size-5' />
              <span className='hidden sm:inline'>Create Note</span>
              <span className='sm:hidden'>New</span>
            </Link>
            {user && (
              <div className='flex items-center gap-4'>
                <span className='text-responsive'>
                  Hello, {user.name.split(' ')[0]}
                </span>
                {user.isAdmin && (
                  <Link 
                    to="/admin" 
                    className='btn btn-secondary btn-sm sm:btn-md hover-scale'
                  >
                    Admin
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className='btn btn-error btn-sm sm:btn-md hover-scale'
                  aria-label="Logout"
                >
                  <LogOut />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
