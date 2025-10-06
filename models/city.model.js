const mongoose = require("mongoose");


const citySchema = new mongoose.Schema({
    city_name: String,
    city_country_id: Number,
    city_state_id: Number,
    details: String,
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });


module.exports = mongoose.model("city", citySchema);