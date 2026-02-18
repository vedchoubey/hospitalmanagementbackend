const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require("./app");

// Load env
dotenv.config();

// Connect database
connectDB();

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});