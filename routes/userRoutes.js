const express = require("express");
const router = express.Router();
const{
      registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getUsers,
} = require("../controllers/userController");

const auth = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { body } = require("express-validator");
const multer = require("../utils/multerConfig");


router.post('/register',
  multer.fields([
    { name: "image", maxCount: 1 },
    { name: "cv", maxCount: 1 },
  ]),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars"),
  ],
  validateRequest,
  registerUser,
);

router.get("/", getUsers);

router.post("/login", loginUser);
router.get("/profile", auth, getUserProfile);
router.put("/profile", auth, updateUserProfile);
router.delete("/profile", auth, deleteUserAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);

module.exports = router;


