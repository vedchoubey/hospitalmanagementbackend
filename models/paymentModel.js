const {Schema,model} = require("mongoose");

const PaymentSchema = new Schema({

    patientId:{
        type: Schema.Types.ObjectId,
        ref: "Patiet",
    },
    amount: Number,
    paymentType: {
        type: String,
        enum: ["CASH","CARD","UPI","INSURANCE"],
    },
    status:{
        type: String,
        enum: ["PENDING","PAID","FAILED"],
        default: "PENDING",
    },
    paidAt: Date,

},
  { timestamps: true}
);

const PaymentModel = model("Payment",PaymentSchema);

module.exports = PaymentModel;