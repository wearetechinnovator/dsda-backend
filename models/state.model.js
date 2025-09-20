const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema({
    state_id: {
        type: String,
        required: true
    },
    state_name: {
        type: String,
        required: true,
        trim: true
    },
    state_slug: {
        type: String,
        required: true,
        trim: true
    },
    state_country_id: {
        type: String, // references `country_id` from Country schema
        required: true
    },
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });

module.exports = mongoose.model("State", stateSchema);
