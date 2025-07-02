const express = require("express");
const passport = require("passport");
const { generateToken } = require("../utils/token");

const router = express.Router();

// GOOGLE
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const token = generateToken(req.user._id);
    // Temporary response to verify token generation without frontend
    res.status(200).json({ message: "OAuth login successful", token });
  }
);

// GITHUB
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    const token = generateToken(req.user._id);
    // Temporary response to verify token generation without frontend
    res.status(200).json({ message: "OAuth login successful", token });
  }
);

module.exports = router;