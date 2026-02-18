const jwt = require("jsonwebtoken");

const protect = (req,res,next) => {
    try{

        //Get Token from Header

        const authHeader = req.headers.authorization;

        // Check token exists

        if(!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(401).json({
                message: "Access denied .No tokens provided"
            })
        }

        //Extract token

        const token = authHeader.split(" ")[1];

        //verify token

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        //Attach user to request 

        req.user = decoded;

        //Move to Controller

        next();
    
    }

    catch(error){
        return res.status(401).json({
            message: "Invalid Or expired token"
        })

    }
}

module.exports = protect;