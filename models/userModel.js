const {Schema,model} = require("mongoose");
const bcrypt = require("bcrypt");

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

//password hash middleware

UserSchema.pre("save", async function () {

  // password change nahi hua → skip hashing
  if (!this.isModified("password")) return;

  // salt generate
  const salt = await bcrypt.genSalt(10);

  // hash password
  this.password = await bcrypt.hash(this.password, salt);
});


UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const UserModel = model("User",UserSchema);
module.exports = UserModel;