import React from 'react'
import { Link } from 'react-router'
import { PlusIcon } from 'lucide-react'


const Navbar = () => {
  return (
    <header className='bg-base-300 border-b border-base-content/10'>
      <div className='container mx-auto p-4'>
        <div className='flex justify-between items-center'>
          <Link to="/" >
            <h1 className='text-3xl font-bold text-primary font-mono tracking-tighter'>NoteBookApp</h1>
          </Link>
          <Link to="/create" className='btn btn-primary'>
          <PlusIcon className='size-5' />
          <span>Create Note</span></Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar
