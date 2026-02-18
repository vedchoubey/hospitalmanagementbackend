const express = require("express");

const authRoutes = require("./routes/auth.routes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Server is running");
});

module.exports = app;