const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const ROLES = require("../constants/roles");
const {createDoctor,getAllDoctors} = require("../controllers/doctor.controller");

//CREATE -> ADMIN ONLY

router.post("/",protect,authorize(ROLES.ADMIN),createDoctor);

//GET ALL -> ANY LOGGED USER

router.get("/",protect,getAllDoctors);

module.exports = router;