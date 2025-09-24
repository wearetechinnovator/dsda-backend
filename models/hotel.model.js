const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    hotel_id: String,
    hotel_name: String,
    hotel_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotel_categories'
    },
    hotel_year_of_establishment: String,
    hotel_zone_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'zone'
    },
    hotel_district_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'district'
    },
    hotel_police_station_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'policestation'
    },
    hotel_sector_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sector'
    },
    hotel_block_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'block'
    },
    hotel_address: String,
    hotel_email: String,
    hotel_reception_phone: String,
    hotel_proprietor_name: String,
    hotel_proprietor_phone: String,
    hotel_manager_name: String,
    hotel_manager_phone: String,
    hotel_manager_phone_alternative: String,
    hotel_minimum_rate: String,
    hotel_maximum_rate: String,
    hotel_has_restaurant: {
        type: String,
        enum: ['0', '1'],// 1=`YES` | 0=`NO`
        default: '0'
    },
    hotel_has_conference_hall: {
        type: String,
        enum: ['0', '1'], // 1=`YES` | 0=`NO`
        default: '0'
    },
    hotel_has_ac: {
        type: String,
        enum: ['0', '1'], // 1=`YES` | 0=`NO`
        default: '0'
    },
    hotel_has_swimming_pool: {
        type: String,
        enum: ['0', '1'], // 1=`YES` | 0=`NO`
        default: '0'
    },
    hotel_has_parking: {
        type: String,
        enum: ['0', '1'], // 1=`YES` | 0=`NO`
        default: '0'
    },
    hotel_website: String,
    hotel_gmb: String,
    hotel_distance_from_main_road: String,
    hotel_distance_from_sea_beach: String,
    hotel_gallery_image: [],
    hotel_document: [],
    hotel_room_type: [],
    hotel_username: String,
    hotel_password: String,
    hotel_1_bed_room: String,
    hotel_2_bed_room: String,
    hotel_3_bed_room: String,
    hotel_4_bed_room: String,
    hotel_5_bed_room: String,
    hotel_6_bed_room: String,
    hotel_7_bed_room: String,
    hotel_8_bed_room: String,
    hotel_9_bed_room: String,
    hotel_10_bed_room: String,
    hotel_total_room: String,
    hotel_total_bed: String,
    last_login_ip: String,
    last_login_date_time: String,
    hotel_status: {
        type: String,
        enum: ['0', '1'], // 0=`Inactive` | 1=`Active`
        default: '0'
    },
    isDel: {
        type: String,
        enum: ['0', '1', '2'], // 0=`Active` | 1=`Trash` | 2=`Permanent Delete`
        default: '0'
    }
}, { timestamps: true })


module.exports = mongoose.model("hotel", hotelSchema);
