import React from 'react'
import {NotebookIcon} from 'lucide-react'
import { Link } from 'react-router-dom'
const NoteNoteFound = () => {
  return (
    <div className='empty-state'>
      <div className="icon-container">
        <NotebookIcon className='icon-large text-primary'/>
      </div>
      <div className="space-y-3">
        <h2 className='heading-responsive'>No notes found</h2>
        <p className='text-responsive text-base-content/70'>Your notebook is empty. Start by creating your first note!</p>
      </div>
      <Link 
        to='/create' 
        className='btn-primary-full hover-scale'
      >
        <NotebookIcon className="icon-small" />
        Create your first note
      </Link>
    </div>
  )
}

export default NoteNoteFound
