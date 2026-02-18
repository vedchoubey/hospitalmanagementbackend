const express = require("express")
const { loginUser } = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login",loginUser);

// 🧪 TEST PROTECTED ROUTE
router.get("/test", protect, (req, res) => {
  res.json({
    message: "You are authorized",
    user: req.user,
  });
});

module.exports = router;
