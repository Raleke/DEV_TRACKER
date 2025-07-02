const Project = require("../models/Project");
const Task = require("../models/Task");
const logger = require("../utils/logger");


const createProject = async (req, res, next) => {
  try {
    const { name, description, startTime, isRunning } = req.body;

    if (!name || !description || !startTime) {
      return next(new Error("All fields are required"));
    }

    const project = await Project.create({
      name,
      description,
      startTime,
      isRunning: isRunning ?? false,
      user: req.user.id,
    });

    logger.info(`Project created by ${req.user.id}`);
    res.status(201).json({ msg: "Project created", project });
  } catch (err) {
    next(err);
  }
};


const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user.id });
    res.status(200).json({ projects });
  } catch (err) {
    next(err);
  }
};


const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project || project.user.toString() !== req.user.id) {
      return next(new Error("Project not found or unauthorized"));
    }

    res.status(200).json({ project });
  } catch (err) {
    next(err);
  }
};


const updateProject = async (req, res, next) => {
  try {
    const updated = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return next(new Error("Project not found or unauthorized"));
    }

    logger.info(`Project updated: ${updated._id}`);
    res.status(200).json({ msg: "Project updated", project: updated });
  } catch (err) {
    next(err);
  }
};


const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return next(new Error("Project not found or unauthorized"));
    }

    await Task.deleteMany({ project: req.params.id });

    logger.info(`Project deleted with tasks: ${req.params.id}`);
    res.status(200).json({ msg: "Project and related tasks deleted" });
  } catch (err) {
    next(err);
  }
};


const findProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new Error("Project not found"));
    res.status(200).json({ project });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  findProject,
};