const { default: mongoose } = require("mongoose");
const amenitiesModel = require("../models/amenities.model");
const fetch = require("node-fetch");
const settingModel = require("../models/setting.model");


// USE IN CRON JOB TO SYNC AMENITIES PAYMENT DATA MONTHLY
// =======================================================
const addAmenities = async (req, res) => {
    try {
        // Get Start and End Date of Previous Month;
        const d = new Date();
        const fmtLocal = (date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const startDate = fmtLocal(new Date(d.getFullYear(), d.getMonth() - 1, 1));
        const endDate = fmtLocal(new Date(d.getFullYear(), d.getMonth(), 0));

        // Current month and year
        const currentYear = d.getFullYear();
        const currentMonth = d.getMonth() + 1; // getMonth() is 0-indexed (0 = Jan)

        // Previous month and year
        let previousMonth = currentMonth - 1;
        let previousYear = currentYear;

        if (previousMonth === 0) {
            previousMonth = 12;
            previousYear = currentYear - 1;
        }


        // Get Total Amenities Paid Amount;
        const req = await fetch(process.env.BOOKING_API + '/check-in/get-hotel-wise-total-amount', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                startDate,
                endDate
            })
        })
        const totalAmenities = await req.json();

        // Prepare bulk operations
        const bulkOps = totalAmenities.map(item => ({
            updateOne: {
                filter: {
                    amenities_hotel_id: item.hotelId,
                    amenities_month: previousMonth,
                    amenities_year: previousYear
                },
                update: {
                    $set: {
                        amenities_amount: item.totalAmount
                    }
                },
                upsert: true // insert if not exists
            }
        }));

        const result = await amenitiesModel.bulkWrite(bulkOps);


        // Last bill genaration month and year update
        await settingModel.updateOne({}, {
            $set: {
                bill_generate_last_month: previousMonth,
                bill_generate_last_year: previousYear
            }
        })

        return res.send(result)

    } catch (error) {
        console.error(error);
    }
}


const updateAmenities = async (req, res) => {
    const { mode, transactionId, status, receiptNo, id } = req.body;


    if ([mode, transactionId, status, id].some(field => !field || field === "")) {
        return res.status(400).json({ err: "All fields are required" });
    }

    try {
        const data = await amenitiesModel.findByIdAndUpdate(id, {
            amenities_payment_mode: mode,
            amenities_payment_transaction_id: transactionId,
            amenities_receipt_number: receiptNo,
            amenities_payment_status: status === "ni" ? '0' : status,
            amenities_payment_init: status === "ni" ? '0' : '1',
        }, { new: true });

        if (!data) {
            return res.status(404).json({ err: 'Amenity not updated' });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Something went wrong" });
    }
}


const getAmenities = async (req, res) => {
    const all = req.body?.all;
    const id = req.body?.id;
    const limit = req.body?.limit ?? 10;
    const page = req.body?.page ?? 1;
    const search = req.body?.search?.trim();
    const skip = (page - 1) * limit;
    const startDate = req.body?.startDate;
    const endDate = req.body?.endDate;
    const hotelId = req.body?.hotelId;
    const month = req.body?.month;
    const year = req.body?.year;
    const payStatus = req.body?.payStatus;


    try {

        if (id) {
            const data = await amenitiesModel.findOne({ _id: id, isDel: "0" }).populate('amenities_hotel_id');
            if (!data) {
                return res.status(404).json({ err: 'No data found' });
            }

            return res.status(200).json(data);
        }

        if (all) {
            const data = await amenitiesModel.find({ isDel: "0" }).populate({
                path: 'amenities_hotel_id',
                select: " hotel_name hotel_category hotel_zone_id hotel_district_id hotel_police_station_id hotel_sector_id hotel_block_id",
                populate: {
                    path: ["hotel_category", "hotel_zone_id", "hotel_district_id", "hotel_police_station_id", "hotel_sector_id", "hotel_block_id"],
                },
            });
            if (!data) {
                return res.status(404).json({ err: 'No data found' });
            }

            return res.status(200).json(data);
        }

        if (search) {
            const regex = new RegExp(search, "i");
            let match = { isDel: "0" };
            if (hotelId) match.amenities_hotel_id = new mongoose.Types.ObjectId(String(hotelId));

            const data = await amenitiesModel.aggregate([
                { $match: match },
                {
                    $lookup: {
                        from: "hotels",
                        localField: "amenities_hotel_id",
                        foreignField: "_id",
                        as: "amenities_hotel_id"
                    }
                },
                { $unwind: "$amenities_hotel_id" },
                {
                    $match: {
                        $or: [
                            { "amenities_payment_transaction_id": { $regex: regex } },
                            { "amenities_hotel_id.hotel_name": { $regex: regex } }
                        ]
                    }
                }
            ]);

            // remove docs where populate returned null
            const filtered = data.filter(d => d.amenities_hotel_id);

            if (!filtered.length) {
                return res.status(404).json({ err: "No data found" });
            }

            return res.status(200).json(filtered);
        }

        let query = { isDel: "0" };
        if (startDate && endDate) {
            query.amenities_date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        if (hotelId) query.amenities_hotel_id = hotelId;
        if (year) query.amenities_year = year;
        if (month) query.amenities_month = month;
        if (payStatus) {
            if (payStatus === "1") query.amenities_payment_status = payStatus;
            if (payStatus !== "1") {
                query.amenities_payment_status = { $ne: "1" }
            }
        }



        const data = await amenitiesModel.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 })
            .populate('amenities_hotel_id');

        const totalCount = await amenitiesModel.countDocuments(query);

        const result = { data: data, total: totalCount, page, limit };

        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

};


// Get Hotel wise Total Amenity
const getTotalAmenityPay = async (req, res) => {
    const { hotelId } = req.body;

    if (!hotelId) {
        return res.status(400).json({ err: "Please provide hotel" });
    }

    try {
        const totalPay = await amenitiesModel.aggregate([
            {
                $match: {
                    amenities_hotel_id: new mongoose.Types.ObjectId(hotelId),
                    isDel: '0',
                    amenities_payment_status: '1'
                }
            },
            {
                $group: {
                    _id: '$amenities_hotel_id',
                    totalAmount: { $sum: '$amenities_amount' },
                    count: { $sum: 1 } // optional: number of records
                }
            },
            {
                $lookup: {
                    from: 'hotels',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'hotel'
                }
            },
            { $unwind: '$hotel' },
            {
                $project: {
                    _id: 0,
                    hotel_id: '$_id',
                    hotel_name: '$hotel.hotel_name',
                    totalAmount: 1,
                    count: 1
                }
            }
        ]);

        if (totalPay.length < 0) {
            return res.status(404).json({ err: "No Payment" })
        }

        return res.status(200).json(totalPay)

    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

}





module.exports = {
    addAmenities,
    getAmenities,
    updateAmenities,
    getTotalAmenityPay
}