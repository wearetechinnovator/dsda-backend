const amenitiesModel = require("../models/amenities.model");
const fetch = require("node-fetch");


// USE IN CORN JOB TO SYNC AMENITIES PAYMENT DATA MONTHLY
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
                start_date: startDate,
                end_date: endDate
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
            amenities_payment_status: status,
            amenities_receipt_number: receiptNo,
            amenities_payment_init: '1'
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
    const id = req.body?.id;
    const limit = req.body?.limit ?? 10;
    const page = req.body?.page ?? 1;
    const search = req.body?.search?.trim();
    const skip = (page - 1) * limit;
    const startDate = req.body?.startDate;
    const endDate = req.body?.endDate;
    const hotelId = req.body?.hotelId;

    try {

        if (id) {
            const data = await amenitiesModel.findOne({ _id: id, isDel: "0" }).populate('amenities_hotel_id');
            if (!data) {
                return res.status(404).json({ err: 'No data found' });
            }

            return res.status(200).json(data);
        }

        if (search) {
            const regex = new RegExp(search, "i");

            const data = await await amenitiesModel.aggregate([
                { $match: { isDel: "0" } },
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
                            { amenities_payment_transaction_id: { $regex: regex } },
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
        if (hotelId) {
            query.amenities_hotel_id = hotelId;
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


module.exports = {
    addAmenities,
    getAmenities,
    updateAmenities
}