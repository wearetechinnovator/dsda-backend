const mongoose = require("mongoose");


const districtSchema = new mongoose.Schema({
    name: String,
    details: String,
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });


module.exports = mongoose.model("district", districtSchema);
