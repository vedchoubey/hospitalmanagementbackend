const authorize = (...allowedRoles) => {
    return (req,res,next) => {
        try{
            // check user exists

            if(!req.user){
                return res.status(401).json({
                    message: "Unauthorized.Please Login",
                })
            }

            //check role allowed

            if(!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    message: "Access denied. Insufficient Permissions"
                })
            }

            // role valid --> proceed
            next()
        }

        catch(error){
            res.status(500).json({
                message: "Role Authorization eror"
            })

        }
    }
}

module.exports = authorize;