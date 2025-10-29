const mongoose = require("mongoose");


const settingSchema = new mongoose.Schema({
    title: String,
    email: String,
    contact_number: String,
    address: String,
    charges_per_tourist: String,
    bill_generate_last_month:Number,
    bill_generate_last_year:Number,
    age_for_charges: {
        type: Number,
        default: 5
    },
    day_for_checkin_checkout: {
        type: Number,
        default: 2
    },
    payment_start_date: {
        type: Number,
        default: 5
    },
    logo: String,
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });


module.exports = mongoose.model("setting", settingSchema);
