const settingModel = require("../models/setting.model");


const create = async (req, res) => {
    const {
        title, email, contact_number, address, charges_per_tourist, logo,
        age_for_charges, day_for_checkin_checkout, payment_start_date, booking_oparetion,
        payment_oparetion
    } = req.body;

    // validation
    if ([title, charges_per_tourist, logo, email, contact_number,
        age_for_charges, day_for_checkin_checkout, payment_start_date]
        .some(field => !field || field === "")
    ) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {

        const newSetting = await settingModel.create({
            title,
            email,
            contact_number,
            address,
            charges_per_tourist,
            id_card_list,
            logo,
            age_for_charges,
            day_for_checkin_checkout,
            payment_start_date,
            payment_oparetion,
            booking_oparetion
        });

        return res.status(201).json(newSetting);

    } catch (error) {

        return res.status(500).json({ err: "Something went wrong" });
    }
};


const update = async (req, res) => {
    const { title, email, contact_number,
        address, charges_per_tourist, logo, isLogo,
        age_for_charges, day_for_checkin_checkout, payment_start_date,
        payment_oparetion,
        booking_oparetion
    } = req.body;


    if (isLogo) {
        await settingModel.updateOne({}, { logo })
        return res.status(200).json({ msg: "Logo update success" });
    }

    if ([title, charges_per_tourist, logo, email, contact_number,
        age_for_charges, day_for_checkin_checkout, payment_start_date]
        .some(field => !field || field === "")
    ) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {
        const update = await settingModel.updateOne({}, {
            title, email, contact_number, address, charges_per_tourist, logo,
            age_for_charges, day_for_checkin_checkout, payment_start_date,
            payment_oparetion, booking_oparetion
        })

        if (update.modifiedCount === 0) {
            return res.status(304).json({ err: 'No changes applied' });
        }

        return res.status(200).json({ msg: "Setting update success" });

    } catch (error) {

        return res.status(500).json({ err: "Something went wrong" });
    }

}

const get = async (req, res) => {
    try {
        const setting = await settingModel.findOne({});

        if (!setting) {
            return res.status(404).json({ err: "No settings found" });
        }

        return res.status(200).json(setting);

    } catch (error) {

        return res.status(500).json({ err: "Something went wrong" });
    }
};


module.exports = {
    create,
    update,
    get
}