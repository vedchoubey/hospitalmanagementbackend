const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use("/auth",authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT ;


app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
