const {Schema,model} = require("mongoose");

const MedicalRecordSchema = new Schema({
    patientId:{
        type: Schema.Types.ObjectId,
        ref: "Patient"
    },
    doctorId:{
        type: Schema.Types.ObjectId,
        ref: "Doctor"
    },
    diagnosis: String,
    prescriptions: String,
    notes: String


},
{
    timestamps: true
}
);

const MedicalRecordModel = model("MedicalRecord",MedicalRecordSchema);