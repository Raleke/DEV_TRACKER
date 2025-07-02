const  mongoose = require("mongoose");

const projectSchema = mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startTime: {
  type: Date,
  default: null,
},
isRunning: {
  type: Boolean,
  default: false,
},
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    },
     { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
