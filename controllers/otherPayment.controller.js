const otherPaymentModel = require("../models/otherPayment.model");


const addPayment = async (req, res) => {
    const { hotel, purpose, amount, refId, paymentDate, status } = req.body;

    if ([hotel, purpose, amount, refId, paymentDate, status].some(field => !field || field === "")) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {
        const insert = await otherPaymentModel.create({
            other_payment_hotel_id: hotel,
            other_payment_amount: amount,
            other_payment_purpose: purpose,
            other_payment_payment_ref_no: refId,
            other_payment_payment_date: paymentDate,
            other_payment_payment_status: status
        });

        if (!insert) {
            return res.status(401).json({ err: 'Payment not added' })
        }

        return res.status(200).json(insert);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ err: "Something went wrong" });
    }
}

const updatePayment = async (req, res) => {
    const { hotel, purpose, amount, refId, paymentDate, status, id } = req.body;

    if ([hotel, purpose, amount, refId, paymentDate, status, id].some(field => !field || field === "")) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {

        const result = await otherPaymentModel.updateOne({ _id: id }, {
            $set: {
                other_payment_hotel_id: hotel,
                other_payment_amount: amount,
                other_payment_purpose: purpose,
                other_payment_payment_ref_no: refId,
                other_payment_payment_date: paymentDate,
                other_payment_payment_status: status
            }
        })

        if (result.modifiedCount === 0) {
            return res.status(304).json({ err: 'Payment not update' });
        }

        return res.status(200).json(result);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

}


const getPayment = async (req, res) => {
    const id = req.body?.id;
    const limit = req.body?.limit ?? 10;
    const page = req.body?.page ?? 1;
    const search = req.body?.search?.trim();
    const trash = req.body?.trash;

    const skip = (page - 1) * limit;

    try {
        if (id) {
            const data = await otherPaymentModel.findOne({ _id: id, isDel: "0" });
            if (!data) {
                return res.status(404).json({ err: 'No data found' });
            }

            return res.status(200).json(data);
        }

        if (search) {
            const regex = new RegExp(search, "i");

            const data = await otherPaymentModel.find({
                isDel: "0", other_payment_payment_ref_no: regex
            }).populate('other_payment_hotel_id')

            return res.status(200).json(data);
        }


        const data = await otherPaymentModel.find({
            isDel: trash ? "1" : "0"
        }).skip(skip).limit(limit).sort({ _id: -1 }).populate('other_payment_hotel_id');

        const totalCount = await otherPaymentModel.countDocuments({ isDel: trash ? "1" : "0" });

        const result = { data: data, total: totalCount, page, limit };

        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

};



module.exports = {
    addPayment,
    getPayment,
    updatePayment
}