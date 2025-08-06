import express from 'express';
import {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  rateTask,
  getTask,
} from '../controllers/task.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware); // Apply auth to all task routes

router.post('/', createTask);
router.get('/', getAllTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/rate', rateTask);
router.get('/',getTask);

export default router;
