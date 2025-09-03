const mongoose = require("mongoose");


const zoneSchema = new mongoose.Schema({
    name: String,
    details: String,
    status: {
        type: String,
        enum: ['0', '1'], // 0=Inactive | 1=Active
        default: '1'
    },
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });


module.exports = mongoose.model("zone", zoneSchema);
