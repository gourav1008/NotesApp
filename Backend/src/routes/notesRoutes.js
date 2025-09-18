import express from 'express';
import { deleteNote, getNotes, postNotes, updateNote, getNoteById } from '../controller/notesController.js';
import { protect } from '../middleware/auth.js';
import { validateNote, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

router.route('/').get(protect, getNotes).post(protect, validateNote, postNotes);
router.route('/:id').get(protect, validateObjectId, getNoteById).put(protect, validateObjectId, validateNote, updateNote).delete(protect, validateObjectId, deleteNote);

export default router;