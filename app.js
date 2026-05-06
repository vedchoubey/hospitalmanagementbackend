const express = require("express");

const authRoutes = require("./routes/auth.routes");
const departmentRoutes = require("./routes/department.routes");
const doctorRoutes = require("./routes/doctor.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/departments",departmentRoutes);
app.use("/doctors",doctorRoutes);

//error Handler
app.use(errorHandler);

// Health check
app.get("/", (req, res) => {
  res.send("Server is running");
});

module.exports = app;