const Department = require("../models/departmentModel");

const createDepartment = async (data) => {
    const department = await Department.create(data);
    return department;

}
const getAllDepartments = async () => {
    return await Department.find({isActive: true})
}

module.exports = {createDepartment,getAllDepartments};