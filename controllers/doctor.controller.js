const doctorService = require("../services/doctor.service");

//CREATE DOCTOR 

exports.createDoctor = async (req,res) => {
    try{
        const doctor = await doctorService.createDoctor(req.body);

        res.status(201).json({
            message: "Doctor created successfully",
            data: doctor,
        });
    }
    catch(error){
        res.status(400).json({
            message: error.message,
        })
    }
};

//GET ALL DOCTORS

exports.getAllDoctors = async (req,res) => {
    try{
        const doctors = await doctorService.getAllDoctors();

        res.json({
            data: doctors,
        });
    }
    catch(error) {
        res.status(500).json({
            message: "Error fetching doctors",
        })
    }
};