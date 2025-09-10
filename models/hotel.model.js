const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: String,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotelcategory'
    },
    year_of_establishment: String,
    zone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'zone'
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'district'
    },
    police_station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'policestation'
    },
    sector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sector'
    },
    block: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'block'
    },
    address: String,
    email: String,
    reception_phone: String,
    proprietor_name: String,
    proprietor_phone: String,
    manager_name: String,
    manager_phone: String,
    manager_phone_alternative: String,
    minimum_rate: String,
    maximum_rate: String,
    has_restaurant: {
        type: Boolean,
        enum: ['0', '1'],// 1=`YES` | 0=`NO`
        default: '0'
    },
    has_conference_hall: {
        type: Boolean,
        enum: ['0', '1'], // 1=`YES` | 0=`NO`
        default: '0'
    },
    has_ac: {
        type: Boolean,
        enum: ['0', '1'], // 1=`YES` | 0=`NO`
        default: '0'
    },
    has_swiming_pool: {
        type: Boolean,
        enum: ['0', '1'], // 1=`YES` | 0=`NO`
        default: '0'
    },
    website: String,
    gmb: String,
    distance_from_main_road: String,
    distance_from_sea_beach: String,
    gallery_image: String,
    document: String,
    username: String,
    password: String,
    last_login_ip: String,
    last_login_date_time: String,
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=`Active` | 1=`Trash` | 2=`Permanent Delete`
        default: '0'
    }
}, { timestamps: true })


module.exports = mongoose.model("hotel", hotelSchema);
