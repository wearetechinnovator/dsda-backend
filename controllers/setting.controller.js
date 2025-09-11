const settingModel = require("../models/setting.model");


const create = async (req, res) => {
    const { title, email, contact_number, address, charges_per_tourist, logo } = req.body;

    // validation
    if (!title || title === "" || !id_card_list || id_card_list.length === 0) {
        return res.status(400).json({ err: "Please fill the required fields" });
    }

    try {

        const newSetting = await settingModel.create({
            title,
            email,
            contact_number,
            address,
            charges_per_tourist,
            id_card_list,
            logo
        });

        return res.status(201).json(newSetting);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Something went wrong" });
    }
};


const update = async (req, res) => {
    const { title, email, contact_number,
        address, charges_per_tourist, logo, isLogo } = req.body;


    if (isLogo) {
        await settingModel.updateOne({}, { logo })
        return res.status(200).json({ msg: "Logo update success" });
    }

    if ([title, charges_per_tourist].some(field => !field || field === "")) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {
        const update = await settingModel.updateOne({}, {
            title, email, contact_number, address, charges_per_tourist, logo
        })

        if (update.modifiedCount === 0) {
            return res.status(304).json({ err: 'No changes applied' });
        }

        return res.status(200).json({ msg: "Setting update success" });

    } catch (error) {
        console.log(error);
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
        console.error(error);
        return res.status(500).json({ err: "Something went wrong" });
    }
};


module.exports = {
    create,
    update,
    get
}