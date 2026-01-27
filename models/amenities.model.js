const mongoose = require("mongoose");


const amenitiesSchema = new mongoose.Schema({
    amenities_hotel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotel",
        index: true
    },   // On Payment Creation
    amenities_amount: Number,   // On Payment Creation
    amenities_payment_date: {
        type: String,
        index: true
    },   // After successs or failure
    amenities_payment_time: String,   // After successs or failure
    amenities_payment_init: {
        type: String,
        enum: ['0', '1'], // 0=No | 1=Yes 
        default: '0'
    },  // Before process
    amenities_payment_mode: {
        type: String,
        enum: ['0', '1'], // 0=Offline | 1=Online
    },  // Before process
    amenities_payment_transaction_id: String, //Online Payment Transaction ID  // After Success
    amenities_payment_ref_no: String, // unique id   // Before process
    amenities_sub_merchant_id: String,// Hotel id;  //  Not required.
    amenities_payment_status: {
        type: String,
        enum: ['0', '1', '2'], // 0=Failed | 1=Success | 2=Processing
        default: '0'
    }, // Before process and After successs or failure
    amenities_transaction_details: String, //  Payment Gateway Response Details  //After successs or failure
    amenities_month: {
        type: String
    }, // On Payment Creation
    amenities_year: {
        type: String
    }, // On Payment Creation
    amenities_receipt_number: String, //Manual Entry
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });


module.exports = mongoose.model("amenities", amenitiesSchema);
