const mongoose = require("mongoose");

const documentTypeSchema = new mongoose.Schema({
    document_type_name: String,
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });


module.exports = mongoose.model("document_types", documentTypeSchema);