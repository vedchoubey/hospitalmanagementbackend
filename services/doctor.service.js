const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Department = require("../models/departmentModel");
const ROLES = require("../constants/roles");

//CREATE DOCTOR

const createDoctor = async (data) => {
    const {
        name,
        email,
        password,
        departmentId,
        specialization,
        qualification,
        experienceYears,
        consultationFee,
        availability,

    } = data;

    // Check department exists

    const department = await Department.findById(departmentId);
    if(!department){
        throw new Error("Department not found");
    }

    //Check email already exists

    const existingUser = await User.findOne({email});
    if(existingUser){
        throw new Error("Email already in use")
    }

    //Hash Password

    const hashedPassword = await bcrypt.hash(password,10);

    //Create User (role Doctor)

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: ROLES.DOCTOR,
    });

    //Create Doctor Profile 

    const doctor = await Doctor.create({
        userId: user._id,
        departmentId,
        specialization,
        qualification,
        experienceYears,
        consultationFee,
        availability,
        isAvailable: true,
    })
    return doctor;
};

//GET ALL DOCTOR

const getAllDoctors = async () => {
    return await Doctor.find()
    .populate("userId", "name email", )
    .populate("departmentId", )
}

module.exports = {
    createDoctor, getAllDoctors
}