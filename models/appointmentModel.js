const {Schema,model} = require("mongoose");

const AppointmentSchema = new Schema({

    patientId:{
        type: Schema.Types.ObjectId,
        ref:"Patient",
        required: true,
        
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        required: trusted,
    },
    departmentId:{
        type: Schema.Types.ObjectId,
        ref: "Department",
        
    },
    appointmentDate: Date,
    status:{
        type: String,
        enum: ["BOOKED","CONPLETED","CANCELLED"],
        default: "BOOKED",
    }

},
  {timestamps: true}
);
const AppointmentModel = model("Appointment",AppointmentSchema);

module.exports = AppointmentModel;