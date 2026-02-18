const express = require("express")
const { loginUser } = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware"); 
const router = express.Router();

router.post("/login",loginUser);

// 🧪 TEST PROTECTED ROUTE
router.get("/test", protect, (req, res) => {
  res.json({
    message: "You are authorized",
    user: req.user,
  });
});

//ADMIN ONLY TEST

router.get("/admin-test",protect,authorize("ADMIN"),(req,res) => {
    res.json({
        message: "Welcome Admin"
    })
})

// Doctor only Test

router.get("/doctor-test",protect,authorize("DOCTOR"),(req,res) => {
    res.json({
        message: "Welcome Doctor"
    })
})

// Multi Role Test

router.get("/staff-test",protect,authorize("ADMIN","RECEPTIONIST","PATIENT"), (req,res) => {
    res.json({
        message: "Welcome Hospital Staff"
    })
})

module.exports = router;
