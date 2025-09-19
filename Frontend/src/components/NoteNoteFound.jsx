import React from 'react'
import {NotebookIcon} from 'lucide-react'
import { Link } from 'react-router-dom'
const NoteNoteFound = () => {
  return (
    <div className='flex flex-col items-center justify-center py-12 sm:py-16 space-y-6 sm:space-y-8 max-w-sm sm:max-w-md mx-auto text-center px-4 sm:px-0'>
      <div className="p-4 sm:p-6 bg-primary/10 rounded-full animate-pulse">
        <NotebookIcon className='size-12 sm:size-16 mx-auto text-primary'/>
      </div>
      <div className="space-y-3">
        <h2 className='text-xl sm:text-2xl font-bold text-base-content'>No notes found</h2>
        <p className='text-sm sm:text-base text-base-content/70'>Your notebook is empty. Start by creating your first note!</p>
      </div>
      <Link 
        to='/create' 
        className='btn btn-primary btn-sm sm:btn-md w-full sm:w-auto min-w-[12rem] gap-2 hover:gap-3 transition-all'
      >
        <NotebookIcon className="size-4 sm:size-5" />
        Create your first note
      </Link>
    </div>
  )
}

export default NoteNoteFound
