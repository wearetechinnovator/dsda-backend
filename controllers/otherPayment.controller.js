const { default: mongoose } = require("mongoose");
const otherPaymentModel = require("../models/otherPayment.model");




const addPayment = async (req, res) => {
    const { hotel, purpose, amount, transactionId, paymentDate, status, receiptNo } = req.body;

    if ([hotel, purpose, amount, transactionId, paymentDate, status].some(field => !field || field === "")) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {
        const insert = await otherPaymentModel.create({
            other_payment_hotel_id: hotel,
            other_payment_amount: amount,
            other_payment_purpose: purpose,
            other_payment_payment_transaction_id: transactionId,
            other_payment_receipt_number: receiptNo,
            other_payment_payment_date: paymentDate,
            other_payment_payment_status: status === "ni" ? '0' : status,
            other_payment_payment_init: status === "ni" ? '0' : '1',
        });

        if (!insert) {
            return res.status(401).json({ err: 'Payment not added' })
        }

        return res.status(200).json(insert);

    } catch (error) {

        return res.status(500).json({ err: "Something went wrong" });
    }
}


const updatePayment = async (req, res) => {
    const { hotel, purpose, amount, transactionId, paymentDate, status, id, receiptNo } = req.body;

    if ([hotel, purpose, amount, transactionId, paymentDate, status, id].some(field => !field || field === "")) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {

        const result = await otherPaymentModel.updateOne({ _id: id }, {
            $set: {
                other_payment_hotel_id: hotel,
                other_payment_amount: amount,
                other_payment_purpose: purpose,
                other_payment_payment_transaction_id: transactionId,
                other_payment_receipt_number: receiptNo,
                other_payment_payment_date: paymentDate,
                other_payment_payment_status: status === "ni" ? '0' : status,
                other_payment_payment_init: status === "ni" ? '0' : '1',
            }
        })

        if (result.modifiedCount === 0) {
            return res.status(304).json({ err: 'Payment not update' });
        }

        return res.status(200).json(result);

    } catch (error) {

        return res.status(500).json({ err: "Something went wrong" });
    }

}


const getPayment = async (req, res) => {
    const id = req.body?.id;
    const limit = req.body?.limit ?? 10;
    const page = req.body?.page ?? 1;
    const search = req.body?.search?.trim();
    const trash = req.body?.trash;
    const hotelId = req.body?.hotelId;
    const amount = req.body?.amount;
    const purpose = req.body?.purpose;
    const transactionId = req.body?.transactionid;
    const skip = (page - 1) * limit;

    try {
        if (id) {
            const data = await otherPaymentModel.findOne({ _id: id, isDel: "0" }).populate('other_payment_hotel_id');
            if (!data) {
                return res.status(404).json({ err: 'No data found' });
            }

            return res.status(200).json(data);
        }

        if (search) {
            const regex = new RegExp(search, "i");
            let query = { isDel: "0" };

            if (transactionId) {
                query.other_payment_hotel_id = new mongoose.Types.ObjectId(String(hotelId));
                query.other_payment_payment_transaction_id = regex;
            } else {
                query.other_payment_payment_ref_no = regex;
            }

            const data = await otherPaymentModel.find(query).populate('other_payment_hotel_id')

            return res.status(200).json(data);
        }


        let query = { isDel: trash ? "1" : "0" };

        if (hotelId) query.other_payment_hotel_id = new mongoose.Types.ObjectId(String(hotelId));
        if (purpose) query.other_payment_purpose = purpose;
        if (amount) query.other_payment_amount = amount;

        const data = await otherPaymentModel.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 })
            .populate('other_payment_hotel_id');

        const totalCount = await otherPaymentModel.countDocuments(query);

        const result = { data: data, total: totalCount, page, limit };

        return res.status(200).json(result);

    } catch (error) {

        return res.status(500).json({ err: "Something went wrong" });
    }

};


const deletePayment = async (req, res) => {
    const { ids, trash } = req.body;

    if (!ids || ids.length === 0) {
        return res.status(400).json({ err: 'Please provide record ids' });
    }

    try {
        const result = await otherPaymentModel.updateMany(
            { _id: { $in: ids } },
            { $set: { isDel: trash ? "1" : "2" } }
        );

        if (result.modifiedCount === 0) {
            return res.status(304).json({ err: 'No changes applied' });
        }

        return res.status(200).json({ msg: 'Records deleted successfully', result });

    } catch (error) {

        return res.status(500).json({ err: "Something went wrong" });
    }

};


const restorePayment = async (req, res) => {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
        return res.status(400).json({ err: 'Please provide record ids' });
    }


    try {
        const result = await otherPaymentModel.updateMany(
            { _id: { $in: ids } },
            { $set: { isDel: "0" } }
        );

        if (result.modifiedCount === 0) {
            return res.status(304).json({ err: 'No changes applied' });
        }

        return res.status(200).json({ msg: 'Records restore successfully', result });

    } catch (error) {

        return res.status(500).json({ err: "Something went wrong" });
    }

};


module.exports = {
    addPayment,
    getPayment,
    updatePayment,
    deletePayment,
    restorePayment
}