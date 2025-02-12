import express from 'express';
import { getTasks, getTaskByID, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import authenticateToken from '../middleware/authMiddleware.js';

// router object
const router = express.Router()

// routes

// GET ALL TASKS LIST || GET
router.get('', authenticateToken, getTasks)

// GET TASKS BY ID
router.get('/:id', authenticateToken, getTaskByID)

// CREATE TASK || POST
router.post('', authenticateToken, createTask)

// UPDATE TASK || PUT
router.put('/:id', authenticateToken, updateTask)

// DELETE TASK || DELETE
router.delete('/:id', authenticateToken, deleteTask)

// GET LIST && ID || GET
// router.get('/:id?', getTasks, getTaskByID)

export default router