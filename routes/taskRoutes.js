const express = require ("express");
const router = express.Router();

const{
      createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  startTaskTimer,
  stopTaskTimer,
} = require("../controllers/taskController");


const auth = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { body } = require("express-validator");


router.post(
  "/:projectId",
  auth,
  [body("title").notEmpty()],
  validateRequest,
  createTask
);

router.get("/", auth, getTasks);
router.get("/:id", auth, getTaskById);
router.put("/:id", auth, updateTask);
router.delete("/:id", auth, deleteTask);
router.post("/:id/start", auth, startTaskTimer);
router.post("/:id/stop", auth, stopTaskTimer);

module.exports = router;