const mongoose = require("mongoose");

const hotelCategorySchema = new mongoose.Schema({
    hotel_category_name: String,
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });


module.exports = mongoose.model("hotelcategory", hotelCategorySchema);
