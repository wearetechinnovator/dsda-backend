const cron = require('node-cron');
const settingModel = require('../models/setting.model');
const { addAmenities } = require('../controllers/amenities.controller');
const fetch = require("node-fetch");
const { autoStatusCheck } = require('../controllers/payGateway.controller');



const amenityCron = async () => {
    const settings = await settingModel.findOne({}, { payment_start_date: 1 });
    const date = parseInt(settings?.payment_start_date);

    // cron.schedule(`5 0 ${date} * *`, async () => {
    //     await addAmenities();
    // }, { timezone: "Asia/Kolkata" });
    cron.schedule(`* * ${date} * *`, async () => {
        console.log("Amenity CRON executed");
        await addAmenities();
    }, { timezone: "Asia/Kolkata" });
}



const autoChekoutCron = async () => {
    cron.schedule("15 * * * *", async () => {
        try {
            const url = process.env.BOOKING_API + "/check-out/auto-checkout";
            const req = await fetch(url, { method: 'POST' });
            const res = await req.json();

        } catch (error) {

        }
    }, { timezone: "Asia/Kolkata" })
}



const autoPaymentCheck = async () => {
    cron.schedule(`5 5 * * *`, async () => {
        await autoStatusCheck();
    }, { timezone: "Asia/Kolkata" });
}


module.exports = {
    amenityCron,
    autoChekoutCron,
    autoPaymentCheck
}
