const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
    country_id: {
        type: String,
        required: true
    },
    country_name: {
        type: String,
        required: true,
        trim: true
    },
    country_slug: {
        type: String,
        required: true,
        trim: true
    },
    country_short_name: {
        type: String,
        required: true,
        trim: true
    },
    country_phone_code: {
        type: String,
        required: true,
        trim: true
    },
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });

module.exports = mongoose.model("Country", countrySchema);
