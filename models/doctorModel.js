const {Schema,model} = require("mongoose");

const DoctorSchema =  new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        requied: true,
        unique: true,
    },
    departmentId:{
        type: Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    specialization:{
        type: String,
        required: true,
        trim: true,

    },
    qualification:{
        type: String,
        trim: true,

    },
    experienceYears:{
        type: Number,
        min: 0,

    },
    consultationFee:{
        type: Number,
        min: 0,

    },
    availability:[
      {
        day: String,
        startTime: String,
        endTime: String,
      }

    ],
    isAvailable: {
        type: Boolean,
        default: true,
    },
},
{
    timestamps: true
}
)

const DoctorModel = model('Doctor', DoctorSchema);
module.exports = DoctorModel;