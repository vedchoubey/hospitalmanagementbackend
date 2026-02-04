const {Schema,model} = require("mongoose");

const PatientSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    age: Number,
    gender: String,
    bloodGroup: String,
    address: String,
    emergencyContact: String,
    medicalHistory: String,
},

{timestamps: true}

)

const PatientModel = model("Patient",PatientSchema);

module.exports = PatientModel;