const express = require("express");
const router = express.Router();

const{
    createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  findProject,
} = require("../controllers/projectController");

const auth = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { body } = require("express-validator");


router.post(
  "/",
  auth,
  [body("name").notEmpty(), body("description").notEmpty(), body("startTime").notEmpty()],
  validateRequest,
  createProject
);

router.get("/", auth, getProjects);
router.get("/:id", auth, getProjectById);
router.get("/raw/:id", auth, findProject); 
router.put("/:id", auth, updateProject);
router.delete("/:id", auth, deleteProject);

module.exports = router;