import React from 'react'
import {NotebookIcon} from 'lucide-react'
import { Link } from 'react-router'
const NoteNoteFound = () => {
  return (
    <div className='flex flex-col items-center justify-center py-16 space-y-6 max-w-md mx-auto text-center'>
      
      <div className="p-4 bg-primary/10 rounded-full">
        <NotebookIcon className='size-16 mx-auto text-primary'/>
        </div>
      <p className='text-center text-2xl font-bold'>No notes found</p>
      <p className='text-center text-base-content/70'>Create a new note to get started</p>
      <Link to='/create' className='btn btn-primary'>Create a new note</Link>
    </div>
  )
}

export default NoteNoteFound
