const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    notice_hotel:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'hotel'
    },
    notice_title: String,
    notice_details: String,
    notice_file: String,
    notice_date: Date,
    notice_status: {
        type: String,
        enum: ["0", "1"], // 0=`Old` | 1=`New`
        default: "1"
    },
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=`Active` | 1=`Trash` | 2=`Permanent Delete`
        default: '0'
    }
},{timestamps: true});

module.exports = mongoose.model('notice', noticeSchema);
