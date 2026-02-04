const {Schema,model} = require("mongoose");

const RoomSchema = new Schema({

    roomNumber: {
        type: String,
        required:  true,
        unique: true,
    },
    type:{
        type: String,
        enum: ["GENERAL","ICU","PRIVATE","SEMI-PRIVATE"]
    },
    floor: Number,
    dailyCharge: Number,
    isOccupied: {
        type: Boolean,
        default: false
    },

},
{
    timestamps: true
}
)

const RoomModel = model("Room",RoomSchema);

module.exports = RoomModel;