const connectRedis = require("../db/redis");
const zoneModel = require("../models/zone.model");


const create = async (req, res) => {
    const { name, status, details } = req.body;

    if ([name, status].some(field => !field || field === "")) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {
        // Check existence;
        const exist = await zoneModel.findOne({ name });
        if (exist) {
            return res.status(409).json({ err: 'Block already exists' })
        }

        const insert = await zoneModel.create({ name, status, details });

        if (!insert) {
            return res.status(401).json({ err: 'Block creation failed' })
        }

        return res.status(200).json(insert);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

}


const update = async (req, res) => {
    const { name, status, details, id } = req.body;

    if ([name, status, id].some(field => !field || field === "")) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {

        const result = await zoneModel.updateOne({ _id: id }, { $set: { name, status, details } })

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
        const redisDB = await connectRedis();

        if (id) {
            const data = await zoneModel.findOne({ _id: id, isDel: "0" });
            if (!data) {
                return res.status(404).json({ err: 'No data found' });
            }
            return res.status(200).json(data);
        }

        if (search) {
            const regex = new RegExp(search, "i");
            const data = await zoneModel.find({ isDel: "0", name: regex })

            return res.status(200).json(data);
        }


        const cacheKey = `zone:page=${page}:limit=${limit}`;
        // const cachedUsers = await redisDB.get(cacheKey);

        // if (cachedUsers) {
        //     return res.status(200).json(JSON.parse(cachedUsers));
        // }

        const data = await zoneModel.find({ isDel: trash ? "1" : "0" })
            .skip(skip).limit(limit).sort({ _id: -1 });
        const totalCount = await zoneModel.countDocuments({ isDel: trash ? "1" : "0" });

        const result = { data: data, total: totalCount, page, limit };

        await redisDB.setEx(cacheKey, 5, JSON.stringify(result));

        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

};


const deleteRecord = async (req, res) => {
    const { ids, trash } = req.body;

    if (!ids || ids.length === 0) {
        return res.status(400).json({ err: 'Please provide record ids' });
    }

    try {
        const result = await zoneModel.updateMany(
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
        const result = await zoneModel.updateMany(
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
    deleteRecord,
    restore
}
