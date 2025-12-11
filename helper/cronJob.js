const cron = require('node-cron');
const settingModel = require('../models/setting.model');
const { addAmenities } = require('../controllers/amenities.controller');
const fetch = require("node-fetch");



const amenityCron = async () => {
    const settings = await settingModel.findOne({}, { payment_start_date: 1 });
    const date = parseInt(settings?.payment_start_date) - 1;

    cron.schedule(`0 12 ${date} * *`, () => {
        addAmenities();
    });
}



const autoChekoutCron = async () => {
    cron.schedule("15 * * * *", async () => {
        try {
            const url = process.env.BOOKING_API + "/check-out/auto-checkout";
            const req = await fetch(url, { method: 'POST' });
            const res = await req.json();
            console.log(res);

        } catch (error) {
            console.log(error)
        }
    })
}



module.exports = {
    amenityCron,
    autoChekoutCron
}
