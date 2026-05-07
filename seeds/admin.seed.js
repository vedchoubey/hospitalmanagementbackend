const mongoose = require("mongoose");
const User = require("../models/userModel");
const ROLES = require("../constants/roles");
const dotenv = require("dotenv");
dotenv.config();

const createAdmin = async()=> {
    try{
        await mongoose.connect(process.env.MONGODB_URI);

        const adminExists = await User.findOne({
            role: ROLES.ADMIN,
        });
        if(adminExists) {
            console.log("Admin already exists");
            process.exit();
            
        }
        
        await User.create({
            name: "Super Admin",
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: ROLES.ADMIN,
            isActive: true,
        })
        console.log("Admin created successfully");
        process.exit();
    }
    catch(error){
        console.error(error);
        process.exit(1);

    }

    }
    createAdmin();   
