const mongoose = require("mongoose");


const payResponseSchema = new mongoose.Schema({
    amenities_payment_id: String, // Store amenity id or other payment id;
    amenities_hotel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotel"
    },
    amenities_payment_transaction_id: String, // Online Payment Transaction ID
    amenities_payment_ref_no: String,
    amenities_transaction_details: String, // Payment Gateway Response Details
    amenities_transaction_type: {
        type: String,
        enum: ['0', '1'], // 0=`Monthly` | 1=`Others`
        default: '0',
    },
}, { timestamps: true });


module.exports = mongoose.model("payresponse", payResponseSchema);
