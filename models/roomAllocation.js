const {Schema,model} = require("mongoose");

const RoomAllocationSchema = new Schema({

    patientId:{
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    roomId:{
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: true,
    },
    allocatedBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    startDate: Date,
    endDate: Date,
    status:{
        type: String,
        enum: ["ACTIVE","COMPLETED"],
        default:"ACTIVE"
    }

},
{
    timestamps:true
}
);

const RoomAllocationModel = model("RoomAllocation",RoomAllocationSchema);

module.exports = RoomAllocationModel;