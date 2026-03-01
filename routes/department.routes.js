const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {createDepartment, getAllDepartments} = require("../controllers/department.controller");

//CREATE ADMIN ONLY

router.post("/",protect,authorize("ADMIN"),createDepartment);

//GET ALL LOGGED USERS

router.get("/",protect,getAllDepartments);

module.exports = router;