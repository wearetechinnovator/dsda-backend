const mongoose = require("mongoose");


const payResponseSchema = new mongoose.Schema({
    amenities_hotel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotel"
    },
    amenities_payment_transaction_id: String, // Online Payment Transaction ID
    amenities_payment_ref_no: String,
    amenities_transaction_details: String, // Payment Gateway Response Details
}, { timestamps: true });


module.exports = mongoose.model("payresponse", payResponseSchema);
