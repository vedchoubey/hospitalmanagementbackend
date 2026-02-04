const {Schema,model} = require("mongoose");

const InvoiceSchema = new Schema({

    patientId:{
        type: Schema.Types.ObjectId,
        ref: "Patient",
    },
    paymentId: {
        type: Schema.Types.ObjectId,
        ref: "Payment",
    },
    items:[
        {
        label: String,
        amount: Number
        },
        
    ],
    totalAmount: Number,
    generatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    issuedAt: Date,
},
{
  timestamps: true
}
);

const InvoiceModel = model("Invoice",InvoiceSchema);

module.exports = InvoiceModel;