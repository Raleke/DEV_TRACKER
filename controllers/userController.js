require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const path = require("path");

const User = require("../models/User");
const Upload = require("../utils/multerConfig");
const sendEmail = require("../utils/mailer");
const { generateToken, generateVerifyToken } = require("../utils/token");
const logger = require("../utils/logger");


const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const errors = [];

    if (!name || !name.trim()) {
      errors.push({ field: "name", message: "Name is required" });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: "email", message: "Invalid email" });
    }

    if (!password || password.length < 6) {
      errors.push({ field: "password", message: "Password must be 6+ characters" });
    }

    if (errors.length > 0) {
      return res.status(400).json({ msg: "Validation failed", errors });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        msg: "Validation failed",
        errors: [{ field: "email", message: "User already exists" }],
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      image: req.files?.image?.[0]?.filename || null,
      cv: req.files?.cv?.[0]?.filename || null,
    });

    const verifyToken = generateVerifyToken(user._id);
    const verifyLink = `${process.env.CLIENT_URL}/api/users/verify-email/${verifyToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify Your DevTrack Account",
      text: `Hello ${user.name}, please verify your email by clicking: ${verifyLink}`,
    });

    logger.info(`New user registered: ${user.email}`);
    res.status(201).json({
      msg: "User registered. Verification email sent.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image ? `/uploads/${user.image}` : null,
      },
    });
  } catch (error) {
    logger.error("Registration failed:", error.message);
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return next(new Error("User not found"));
    if (user.isVerified) return next(new Error("Already verified"));

    user.isVerified = true;
    await user.save();

logger.info(`Email verified: ${user.email}`);
    res.json({ msg: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return next(new Error("Invalid credentials"));
    }

    if (!user.isVerified) {
      return next(new Error("Please verify your email first."));
    }

    const token = generateToken(user._id);

    logger.info(`User logged in: ${email}`);
    res.json({
      msg: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
        image: `/uploads/${user.image}`,
      },
    });
  } catch (err) {
    next(err);
  }
};


const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return next(new Error("User not found"));

    logger.info(`Profile fetched: ${user.email}`);
    res.json({
      ...user._doc,
      image: user.image ? `/uploads/${user.image}` : null,
    });
  } catch (err) {
    next(err);
  }
};


const updateUserProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return next(new Error("User not found"));

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    logger.info(`Profile updated: ${user.email}`);
    res.json({ msg: "Profile updated", user });
  } catch (err) {
    next(err);
  }
};


const deleteUserAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(new Error("User not found"));

    await user.deleteOne();

    logger.info(`User deleted: ${user.email}`);
    res.json({ msg: "User deleted" });
  } catch (err) {
    next(err);
  }
};


const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new Error("User not found"));

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      text: `Click here to reset your password: ${resetLink}`,
    });

    logger.info(`Password reset email sent to: ${email}`);
    res.json({ msg: "Reset link sent" });
  } catch (err) {
    next(err);
  }
};


const resetPassword = async (req, res, next) => {
  try {
    const resetToken = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return next(new Error("Token expired or invalid"));

    const { password } = req.body;
    if (!password || password.length < 6) {
      return next(new Error("Password must be at least 6 characters"));
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);
    res.json({ msg: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getUsers,
};
