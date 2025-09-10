const mongoose = require("mongoose");


const settingSchema = new mongoose.Schema({
    title: String,
    email: String,
    contact_number: String,
    address: String,
    charges_per_tourist: String,
    logo: String,
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });


module.exports = mongoose.model("setting", settingSchema);
