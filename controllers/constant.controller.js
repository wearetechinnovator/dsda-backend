/**
 * All Constant Type related controller here like:
 * ===============================================
 * 1. Document Type
 * 2. Id Card Type
 */

const documentTypeModel = require("../models/documentType.model");
const idCardTypeModel = require("../models/roomType.model");


const get = async (req, res) => {
    // `id` | `document`
    const { which } = req.params;
    let model;

    if (which === "id") {
        model = idCardTypeModel;
    } else if (which === "document") {
        model = documentTypeModel;
    }
    else {
        return res.status(401).json({ err: "Invalid type" });
    }


    try {
        const data = await model.find({ isDel: "0" }, { createdAt: 0, updatedAt: 0, isDel: 0 });
        if (!data || data.length < 1) {
            return res.status(404).json({ err: "Data not found" });
        }

        return res.status(200).json(data);

    } catch (error) {

        return res.status(500).json({ err: "Something went wrong" });
    }

}



module.exports = {
    get
}