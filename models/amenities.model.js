const mongoose = require("mongoose");


const amenitiesSchema = new mongoose.Schema({
    amenities_hotel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotel"
    },
    amenities_amount: Number,
    amenities_payment_date: String,
    amenities_payment_init: {
        type: String,
        enum: ['0', '1'], // 0=No | 1=Yes 
        default: '0'
    },
    amenities_payment_mode: {
        type: String,
        enum: ['0', '1'], // 0=Offline | 1=Online
    },
    amenities_payment_transaction_id: String, //Online Payment Transaction ID
    amenities_payment_ref_no: String, // Hotel id;
    amenities_sub_merchant_id: String,
    amenities_payment_status: {
        type: String,
        enum: ['0', '1', '2'], // 0=Failed | 1=Success | 2=Processing
        default: '2'
    },
    amenities_transaction_details: String, //  Payment Gateway Response Details
    amenities_month: String,
    amenities_year: String,
    amenities_receipt_number: String,
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });


module.exports = mongoose.model("amenities", amenitiesSchema);
