const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const logger = require("../utils/logger");
const { formatDuration } = require("../utils/calculateTime");

const getTaskStats = async (req, res, next) => {
  try {
    const stats = await Task.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const formatted = {
      todo: 0,
      "in-progress": 0,
      done: 0,
    };

    stats.forEach((s) => {
      formatted[s._id] = s.count;
    });

    res.status(200).json({ stats: formatted });
  } catch (err) {
    next(err);
  }
};

const getTimeSpent = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    const totalDuration = tasks.reduce((acc, t) => acc + (t.duration || 0), 0);

    res.status(200).json({
      totalDuration,
      formatted: formatDuration(totalDuration),
    });
  } catch (err) {
    next(err);
  }
};

const getProjectTaskSummary = async (req, res, next) => {
  try {
    const tasks = await Task.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: "$project",
          total: { $sum: 1 },
          done: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } },
          timeSpent: { $sum: "$duration" }
        },
      },
    ]);

    const projects = await Project.find({ user: req.user.id }).select("name");

    const summary = tasks.map((item) => {
      const project = projects.find((p) => p._id.toString() === item._id.toString());
      return {
        projectId: item._id,
        projectName: project?.name || "Unknown",
        totalTasks: item.total,
        completedTasks: item.done,
        timeSpent: item.timeSpent,
        formattedTimeSpent: formatDuration(item.timeSpent),
      };
    });

    res.status(200).json({ summary });
  } catch (err) {
    next(err);
  }
};

const getActivityByDateRange = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return next(new Error("Both 'from' and 'to' date parameters are required"));
    }

    const start = new Date(from);
    const end = new Date(to);

    const tasks = await Task.find({
      user: new mongoose.Types.ObjectId(req.user.id),
      updatedAt: { $gte: start, $lte: end },
    });

    res.status(200).json({
      count: tasks.length,
      tasks: tasks.map((task) => ({
        ...task._doc,
        formattedDuration: formatDuration(task.duration),
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTaskStats,
  getTimeSpent,
  getProjectTaskSummary,
  getActivityByDateRange,
};