require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");
const passport = require("passport");
require("./config/passport"); 

const errorHandler = require("./middlewares/errorMiddleware");

const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware setup
app.use(cors());
app.use((req, res, next) => {
  if (req.is("application/json")) {
    express.json()(req, res, next);
  } else {
    next();
  }
});
app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "dev"));
app.use("/uploads", express.static("uploads"));

// Passport sessions
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/auth", authRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;