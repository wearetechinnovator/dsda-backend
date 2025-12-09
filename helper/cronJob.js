const cron = require('node-cron');
const settingModel = require('../models/setting.model');
const { addAmenities } = require('../controllers/amenities.controller');



const amenityCron = async () => {
    const settings = await settingModel.findOne({}, { payment_start_date: 1 });
    const date = parseInt(settings.payment_start_date) - 1;

    cron.schedule(`0 12 ${date} * *`, () => {
        addAmenities();
        console.log('running a task');
    });

}




module.exports = {
    amenityCron
}
