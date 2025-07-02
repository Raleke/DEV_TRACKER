const Task = require("../models/Task");
const Project = require("../models/Project");
const logger = require("../utils/logger");
const { calculateDuration } = require("../utils/calculateTime");


const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const { projectId } = req.params;

    if (!title || !projectId) {
      return next(new Error("Title and projectId are required"));
    }

    // Validate that project belongs to the logged-in user
    const project = await Project.findById(projectId);
    if (!project || project.user.toString() !== req.user.id) {
      return next(new Error("Project not found or unauthorized"));
    }

    const task = await Task.create({
      title,
      description,
      status: status || "todo",
      project: projectId,
      user: req.user.id,
    });

    logger.info(`Task created by ${req.user.id} in project ${projectId}`);
    res.status(201).json({ msg: "Task created", task });
  } catch (err) {
    next(err);
  }
};


const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return next(new Error("projectId query param is required"));

    const project = await Project.findById(projectId);
    if (!project || project.user.toString() !== req.user.id) {
      return next(new Error("Unauthorized or invalid project"));
    }

    const tasks = await Task.find({ project: projectId, user: req.user.id });
    res.status(200).json({ tasks });
  } catch (err) {
    next(err);
  }
};


const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id) {
      return next(new Error("Task not found or unauthorized"));
    }

    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
};


const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!task) return next(new Error("Task not found or unauthorized"));

    logger.info(`Task updated: ${task._id}`);
    res.status(200).json({ msg: "Task updated", task });
  } catch (err) {
    next(err);
  }
};


const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) return next(new Error("Task not found or unauthorized"));

    logger.info(`Task deleted: ${task._id}`);
    res.status(200).json({ msg: "Task deleted" });
  } catch (err) {
    next(err);
  }
};


const startTaskTimer = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) return next(new Error("Task not found or unauthorized"));
    if (task.isRunning) {
      // Idempotent: return success if already running
      return res.status(200).json({ msg: "Timer already running", task });
    }

    task.isRunning = true;
    task.startTime = new Date();
    await task.save();

    await Project.findByIdAndUpdate(task.project, { isRunning: true });

    logger.info(`Timer started for task ${task._id}`);
    res.status(200).json({ msg: "Timer started", task });
  } catch (err) {
    next(err);
  }
};

   const stopTaskTimer = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) return next(new Error("Task not found or unauthorized"));
    if (!task.isRunning || !task.startTime) {
      // Idempotent: return success if timer not running
      return res.status(200).json({ msg: "Timer not running", task });
    }

    const now = new Date();
    const elapsed = Math.floor((now - task.startTime) / 1000);

    task.isRunning = false;
    task.endTime = now;
    task.duration += elapsed;
    task.startTime = null;
    await task.save();

    // ✅ Check if any other tasks in the same project are still running
    const otherRunningTasks = await Task.find({
      project: task.project,
      isRunning: true,
      user: req.user.id,
    });

    if (otherRunningTasks.length === 0) {
      await Project.findByIdAndUpdate(task.project, { isRunning: false });
      logger.info(` Project ${task.project} marked as not running`);
    }

    logger.info(`Timer stopped for task ${task._id} (+${elapsed}s)`);
    res.status(200).json({ msg: "Timer stopped", task });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  startTaskTimer,
  stopTaskTimer,
};