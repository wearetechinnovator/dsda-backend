const mongoose = require("mongoose");


const idCardTypeSchema = new mongoose.Schema({
    document_type_name: String,
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });


module.exports = mongoose.model("id_card_types", idCardTypeSchema);