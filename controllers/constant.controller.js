/**
 * All Constant Type related controller here like:
 * ===============================================
 * 1. Document Type
 * 2. Id Card Type
 * 3. Room Type
 * 4. Hotel Categories
 * 5. Country
 * 6. State
 * 7. City
 */

const documentTypeModel = require("../models/documentType.model");
const roomTypeModel = require("../models/roomType.model");
const idCardTypeModel = require("../models/roomType.model");
const hotelCategory = require("../models/hotelCategory.model");


const get = async (req, res) => {
    // `room` | `id` | `document` | `hotel-category` | `country` | `state` | `city`
    const { which } = req.params;
    let model;

    if (which === "room") {
        model = roomTypeModel;
    } else if (which === "id") {
        model = idCardTypeModel;
    } else if (which === "document") {
        model = documentTypeModel;
    } else if (which === "hotel-category") {
        model = hotelCategory;
    }
    else {
        return res.status(401).json({ err: "Invalid type" });
    }


    try {
        const data = await model.find({ isDel: "0" }, { createdAt: 0, updatedAt: 0, isDel: 0 });
        if (!data || data.length < 1) {
            console.log("Not found..")
            return res.status(404).json({ err: "Data not found" });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

}



module.exports = {
    get
}