const {Schema,model} = require("mongoose");

const DepartmentSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    image: String,
    description: String,

    isActive: {
        type: Boolean,
        default: true,
    },

},
{
    timestamps: true
}
)

const DepartmentModel = model("Department",DepartmentSchema);

module.exports = DepartmentModel;