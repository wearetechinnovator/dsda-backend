const noticeModel = require("../models/notice.model");



const create = async (req, res) => {
    const { hotel, title, file, date, status, details } = req.body;

    if ([hotel].length < 0) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {

        const insert = await noticeModel.create({
            notice_hotel: [...hotel],
            notice_title: title,
            notice_file: file,
            notice_date: date,
            notice_status: status,
            notice_details: details
        });

        if (!insert) {
            return res.status(401).json({ err: 'Notice not send' })
        }

        return res.status(200).json(insert);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

}


const update = async (req, res) => {
    const { id, hotel, title, file, date, status, details } = req.body;

    if ([hotel].length < 0) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {

        const result = await noticeModel.updateOne({ _id: id }, {
            $set: {
                notice_hotel: [...hotel],
                notice_title: title,
                notice_file: file,
                notice_date: date,
                notice_status: status,
                notice_details: details
            }
        })

        if (result.modifiedCount === 0) {
            return res.status(304).json({ msg: 'No changes applied' });
        }

        return res.status(200).json(result);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

}


const get = async (req, res) => {
    const id = req.body?.id;
    const limit = req.body?.limit ?? 10;
    const page = req.body?.page ?? 1;
    const search = req.body?.search?.trim();
    const trash = req.body?.trash;

    const skip = (page - 1) * limit;

    try {

        if (id) {
            const data = await noticeModel.findOne({ _id: id, isDel: "0" });
            if (!data) {
                return res.status(404).json({ err: 'No data found' });
            }

            return res.status(200).json(data);
        }

        if (search) {
            const regex = new RegExp(search, "i");
            const data = await noticeModel.find({ isDel: "0", name: regex })

            return res.status(200).json(data);
        }


        const data = await noticeModel.find({ isDel: trash ? "1" : "0" })
            .skip(skip).limit(limit).sort({ _id: -1 });
        const totalCount = await noticeModel.countDocuments({ isDel: trash ? "1" : "0" });

        const result = { data: data, total: totalCount, page, limit };

        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

};


// ========= [Get Hotel Wise Notice] ========
const getHotelNotice = async (req, res) => {
    const { hotelId } = req.body;

    if (!hotelId) {
        return res.status(400).json({ err: "Please select hotel" });
    }

    try {
        const getNotice = await noticeModel.find({
            notice_hotel: { $in: [hotelId] },
            isDel: "0"
        }).populate("notice_hotel").sort({ createdAt: -1 });

        if (!getNotice || getNotice.length === 0) {
            return res.status(404).json({ msg: "No notices found for this hotel" });
        }

        return res.status(200).json(getNotice);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ err: "Something went wrong" });
    }
};


const deleteRecord = async (req, res) => {
    const { ids, trash } = req.body;

    if (!ids || ids.length === 0) {
        return res.status(400).json({ err: 'Please provide record ids' });
    }

    try {
        const result = await noticeModel.updateMany(
            { _id: { $in: ids } },
            { $set: { isDel: trash ? "1" : "2" } }
        );

        if (result.modifiedCount === 0) {
            return res.status(304).json({ err: 'No changes applied' });
        }

        return res.status(200).json({ msg: 'Records deleted successfully', result });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

};


const restore = async (req, res) => {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
        return res.status(400).json({ err: 'Please provide record ids' });
    }

    try {
        const result = await noticeModel.updateMany(
            { _id: { $in: ids } },
            { $set: { isDel: "0" } }
        );

        if (result.modifiedCount === 0) {
            return res.status(304).json({ err: 'No changes applied' });
        }

        return res.status(200).json({ msg: 'Records restore successfully', result });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

};



module.exports = {
    create,
    update,
    get,
    getHotelNotice,
    deleteRecord,
    restore
}