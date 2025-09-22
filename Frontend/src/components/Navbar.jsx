import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusIcon, LogOut, MenuIcon, XIcon, UserIcon, ShieldIcon } from 'lucide-react'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'
import toast from 'react-hot-toast'

const Navbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success("Logged out successfully");
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className='bg-base-100 border-b border-base-300/50 sticky top-0 z-50 backdrop-blur-sm'>
      <nav className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={closeMobileMenu}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-primary-content font-bold text-sm">N</span>
            </div>
            <h1 className='text-xl font-bold text-primary tracking-tight'>NotesApp</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/create" 
              className='btn btn-primary btn-sm gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg'
            >
              <PlusIcon className='w-4 h-4' />
              Create Note
            </Link>
            
            {user && (
              <div className='flex items-center gap-4'>
                <div className="flex items-center gap-2 px-3 py-2 bg-base-200 rounded-lg">
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span className='text-sm font-medium'>
                    {user.name.split(' ')[0]}
                  </span>
                </div>
                
                {user.isAdmin && (
                  <Link 
                    to="/admin" 
                    className='btn btn-secondary btn-sm gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg'
                  >
                    <ShieldIcon className='w-4 h-4' />
                    Admin
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className='btn btn-error btn-outline btn-sm gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg'
                  aria-label="Logout"
                >
                  <LogOut className='w-4 h-4' />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden btn btn-ghost btn-sm min-h-11 min-w-11 flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <XIcon className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-base-300/50 bg-base-100">
            <div className="py-4 space-y-2">
              <Link 
                to="/create" 
                className='flex items-center gap-2 py-3 px-4 text-base border-b border-base-300/30 last:border-b-0 hover:text-primary transition-all duration-200 hover:bg-base-300/50 rounded-lg'
                onClick={closeMobileMenu}
              >
                <PlusIcon className='w-5 h-5' />
                Create Note
              </Link>
              
              {user && (
                <>
                  <div className="px-4 py-3 bg-base-200 mx-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-primary" />
                      <span className='text-sm font-medium'>
                        Hello, {user.name.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                  
                  {user.isAdmin && (
                    <Link 
                      to="/admin" 
                      className='flex items-center gap-2 py-3 px-4 text-base border-b border-base-300/30 last:border-b-0 hover:text-primary transition-all duration-200 hover:bg-base-300/50 rounded-lg'
                      onClick={closeMobileMenu}
                    >
                      <ShieldIcon className='w-5 h-5' />
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <button 
                    onClick={handleLogout} 
                    className='flex items-center gap-2 py-3 px-4 text-base border-b border-base-300/30 last:border-b-0 text-error w-full text-left hover:bg-error/10 transition-all duration-200 rounded-lg'
                  >
                    <LogOut className='w-5 h-5' />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar
