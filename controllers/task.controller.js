import Task from '../models/task.model.js';
import User from "../models/user.model.js";
import mongoose from 'mongoose';

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // 1. Create the new task
    const newTask = await Task.create({
      user: req.user.id,
      title,
      description
    });

    // 2. Add reference to this task in the user's tasks array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { tasks: newTask._id } },
      { new: true }
    );

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tasks for logged-in user
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    // Update task owned by user, run validators, return new doc
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found or not authorized' });
    }

    res.status(200).json(task);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rate a task
export const rateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating' });
    }
    const task = await Task.findOne({ _id: id, user: req.user.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.ratings.push(rating);
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, status, minRatings } = req.query;

    // Dynamic filter construction
    const match = { user: userId };
    // Filter by title (partial, case-insensitive)
    if (title) {
      match.title = { $regex: title, $options: 'i' };
    }
    // Filter by completed/pending status
    if (status === 'completed') {
      match.isCompleted = true;
    }
    if (status === 'pending') {
      match.isCompleted = false;
    }

    // Aggregation pipeline
    const pipeline = [
      { $match: match }
    ];

    // Add computed ratings length and minRatings filter if provided
    if (minRatings) {
      pipeline.push(
        {
          $addFields: { ratingCount: { $size: { $ifNull: ['$ratings', []] } } }
        },
        {
          $match: { ratingCount: { $gte: parseInt(minRatings, 10) } }
        }
      );
    }

    // Optional: add sorting or projection
    // pipeline.push({ $sort: { createdAt: -1 } });

    const tasks = await Task.aggregate(pipeline);

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};