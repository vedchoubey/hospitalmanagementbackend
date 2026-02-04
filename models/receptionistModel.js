const {Schema,model, Types} = require("mongoose");

const ReceptionistSchema = new Schema({

    userId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true,
    },
    shift: String,
    deskNumber: String,
},
{
    timestamps: true
}
)

const ReceptionistModel = model("Receptionist", ReceptionistSchema);

module.exports = ReceptionistModel;