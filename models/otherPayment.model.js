const mongoose = require("mongoose");


const otherPaymentSchema = new mongoose.Schema({
    other_payment_hotel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotel"
    },
    other_payment_amount: Number,
    other_payment_payment_date: String,
    other_payment_payment_init: {
        type: String,
        enum: ['0', '1'], // 0=No | 1=Yes 
        default: '0'
    },
    other_payment_payment_mode: {
        type: String,
        enum: ['0', '1'], // 0=Offline | 1=Online
    },
    other_payment_payment_transaction_id: String, //Online Payment Transaction ID
    other_payment_payment_ref_no: String, // Hotel id;
    other_payment_sub_merchant_id: String,
    other_payment_payment_status: {
        type: String,
        enum: ['0', '1', '2'], // 0=Failed | 1=Success | 2=Processing
        default: '2'
    },
    other_payment_transaction_details: String, //  Payment Gateway Response Details
    other_payment_purpose: String,
    other_payment_receipt_number: String,
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });


module.exports = mongoose.model("otherpayment", otherPaymentSchema);
