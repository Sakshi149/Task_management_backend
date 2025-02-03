import express from 'express';
import { getTasks, getTaskByID, createTask, updateTask, deleteTask } from '../controllers/taskController.js';

// router object
const router = express.Router()

// routes

// GET ALL TASKS LIST || GET
router.get('', getTasks)

// GET TASKS BY ID
router.get('/:id', getTaskByID)

// CREATE TASK || POST
router.post('', createTask)

// UPDATE TASK || PUT
router.put('/:id', updateTask)

// DELETE TASK || DELETE
router.delete('/:id', deleteTask)

// GET LIST && ID || GET
router.get('/:id?', getTasks, getTaskByID)

export default router