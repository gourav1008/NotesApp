import express from 'express';
import { deleteNotes, getNotes, postNotes, putNotes, getNoteById } from '../controller/notesController.js';

const router = express.Router();

router.get("/", getNotes)
router.get("/:id", getNoteById)
router.post('/', postNotes)
router.put('/:id', putNotes)
router.delete('/:id', deleteNotes)

export default router;