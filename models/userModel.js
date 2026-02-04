const {Schema,model} = require("mongoose");

const UserSchema = new Schema( {
   
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 8,
    },
    role:{
        type: String,
        enum: ['DOCTOR','PATIENT','RECEPTIONIST','ADMIN'],
        default: "PATIENT"
        
    },
    isActive:{
        type: Boolean,
        default: true

    },
    lastLoginAt:{
        type: Date

    }
    
},

  {
    timestamps: true
 }

)

const UserModel = model("User",UserSchema);
module.exports = UserModel;