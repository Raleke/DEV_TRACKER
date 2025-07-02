const express = require("express");
const router = express.Router();

const{
    getTaskStats,
  getTimeSpent,
  getProjectTaskSummary,
  getActivityByDateRange,
} = require("../controllers/reportController");


const auth = require("../middlewares/authMiddleware");

router.get("/task-stats", auth, getTaskStats);
router.get("/time-spent", auth, getTimeSpent);
router.get("/project-summary", auth, getProjectTaskSummary);
router.get("/activity", auth, getActivityByDateRange);

module.exports = router;