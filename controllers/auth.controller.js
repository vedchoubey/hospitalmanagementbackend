const User = require("../models/userModel");

const loginUser = async(req,res) => {
    try{

         // Get email & password from request body

        const {email,password} = req.body;

        // Validate input

        if(!email || !password ){
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            })
        }

        // Find user by email

        const user = await User.findOne({email});

        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        //Check if User is Active

        if(!user.isActive) {
            return res.status(403).json({
                success:false,
                message: "Deactivated account"
            })
        }

        //Compare Password

        const isMatch = await user.comparePassword(password);

        if(!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            })
        }

        //Update Lat login Time

        user.lastLoginAt = new Date();
        await user.save();

        // sucess response,

        res.status(200).json({
            success : true,
            message : "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })


    }

    



    catch(error){

        //error handling

        res.status(500).json({
            success: false,
            message: " server error",
            error : error.message
        })

    }
};

module.exports = { loginUser };