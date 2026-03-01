const departmentService = require("../services/department.service");

//   CREATE
exports.createDepartment = async( req,res) => {
    try{
        const department = await departmentService.createDepartment(req.body);

        res.status(201).json({
            mesasge: "Departtment created",
            data: department,
        });
    } catch(error) {
        res.status(500).json({
            message: "Error Creating department"
        })
    }
}

//GET ALL

exports.getAllDepartments = async (req,res) => {
    const departments = await departmentService.getAllDepartments();

    res.json(departments);
}