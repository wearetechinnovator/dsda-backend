const mongoose = require("mongoose");


const adminSchema = new mongoose.Schema({
    name: String,
    password: String,
    role: {
        type: String,
        enum: ['Administrator', 'CEO', 'Editor', "DM Office", "Police Station", "State"]
    },
    designation: String,
    profile_picture: String,
    email: String,
    contact: String,
    last_login_ip: String,
    last_login_date_time: String,
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=Active | 1=Trash | 2=Permanent Delete
        default: '0'
    }
}, { timestamps: true });


module.exports = mongoose.model("admin", adminSchema);
