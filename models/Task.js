const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema({
title: {
      type: String,
      required: [true, 'Task title is required'],
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    duration: {
      type: Number, 
      default: 0,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isRunning: { type: Boolean, default: false },
    startTime: { type: Date, default: null },
},
{timestamps: true}
);

module.exports = mongoose.model("Task", TaskSchema);