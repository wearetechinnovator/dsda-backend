const crypto = require("crypto");
const amenitiesModel = require("../models/amenities.model");
const otherPaymentModel = require("../models/otherPayment.model");
const payResponseModel = require("../models/payResponse.model");
const fetch = require("node-fetch");
const { default: mongoose } = require("mongoose");
const settingModel = require("../models/setting.model");



const paymentProcess = async (req, res) => {
    const { id, type } = req.body;

    // =========== [Check Payment Permission active or not] ============
    const getSiteSettingforCheck = await settingModel.findOne({});
    if (!getSiteSettingforCheck.payment_oparetion) {
        return res.status(400).json({ err: "Payment is temporarily unavailable. Please try again later." });
    }


    if (!id || !type) {
        return res.status(500).json({ err: "Please provide data" })
    }


    function generateSecureHash(payload) {
        const secretKey = process.env.PAYMENT_SECRET_KEY;

        // Only keys that participate in hash
        const hashKeys = [
            "addlParam1",
            "aggregatorID",
            "amount",
            "currencyCode",
            "customerEmailID",
            "customerMobileNo",
            "customerName",
            "merchantId",
            "merchantTxnNo",
            "payType",
            "returnURL",
            "transactionType",
            "txnDate"
        ];

        let hashString = "";

        hashKeys.forEach(key => {
            if (payload[key] !== undefined && payload[key] !== null) {
                hashString += String(payload[key]);
            }
        });

        return crypto
            .createHmac("sha256", secretKey)
            .update(hashString, "ascii")
            .digest("hex");
    }


    function getTxnDate() {
        const d = new Date();

        // FORCE IST (ICICI expects IST)
        const istOffset = 330; // minutes
        const ist = new Date(d.getTime() + istOffset * 60000);

        const yyyy = ist.getFullYear();
        const MM = String(ist.getMonth() + 1).padStart(2, "0");
        const dd = String(ist.getDate()).padStart(2, "0");
        const HH = String(ist.getHours()).padStart(2, "0");
        const mm = String(ist.getMinutes()).padStart(2, "0");
        const ss = String(ist.getSeconds()).padStart(2, "0");

        return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
    }

    function replaceSpecialCharsWithSpace(str) {
        return str
            .replace(/[^a-zA-Z0-9]/g, " ") // replace special chars with space
            .replace(/\s+/g, " ")         // remove double/multiple spaces
            .trim();                      // remove leading & trailing space
    }

    try {
        const refNo = String(Date.now() + (Math.floor(Math.random() * 9) + 1));
        let hotelData, amount;

        // Get Amenities Details
        if (type === "monthly") {
            const hotelDetails = await amenitiesModel.findOne({
                _id: new mongoose.Types.ObjectId(String(id))
            }).populate("amenities_hotel_id");

            hotelData = hotelDetails.amenities_hotel_id;
            amount = hotelDetails.amenities_amount;
        }
        else if (type === 'others') {
            const hotelDetails = await otherPaymentModel.findOne({
                _id: new mongoose.Types.ObjectId(String(id))
            }).populate("other_payment_hotel_id");

            hotelData = hotelDetails.other_payment_hotel_id;
            amount = hotelDetails.other_payment_amount;

        } else {
            return res.status(400).json({ err: 'Unable to process payment' });
        }


        const URL = process.env.PAYMENT_INITIATE;
        const payload = {
            "merchantId": process.env.MERCHANT_ID,
            "aggregatorID": process.env.AGGREGATOR_ID,
            "merchantTxnNo": refNo,
            "amount": Number(amount).toFixed(2),
            "currencyCode": "356",
            "payType": "0",
            "customerEmailID": hotelData.hotel_email || "",
            "transactionType": "SALE",
            "returnURL": `${process.env.RETURN_URL}?ref=${refNo}&type=${type}`,
            "txnDate": getTxnDate(),
            "customerMobileNo": hotelData.hotel_proprietor_phone,
            "customerName": replaceSpecialCharsWithSpace(hotelData.hotel_name),
            "addlParam1": type
        };
        payload.secureHash = generateSecureHash(payload);


        const payment = await fetch(URL, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const payResponse = await payment.json();

        if (payResponse.responseCode !== "R1000") {
            return res.status(400).json({ err: 'Unable to process payment' });
        }

        // Amenities Payment Update
        if (type === "monthly") {
            await amenitiesModel.updateOne({ _id: id }, {
                $set: {
                    amenities_payment_init: "1",
                    amenities_payment_status: "2",
                    amenities_payment_mode: "1",
                    amenities_payment_ref_no: refNo,
                    amenities_init_timestamp: Date.now()
                }
            });
        }
        else if (type === 'others') {
            await otherPaymentModel.updateOne({ _id: id }, {
                $set: {
                    other_payment_payment_init: "1",
                    other_payment_payment_status: "2",
                    other_payment_payment_mode: "1",
                    other_payment_payment_ref_no: refNo,
                    other_payment_init_timestamp: Date.now()
                }
            });

        }

        return res.status(200).json({
            redirectUrl: payResponse.redirectURI + "?tranCtx=" + payResponse.tranCtx
        });

    } catch (error) {
        return res.status(500).json({ err: "Something went wrong" })
    }
}


const paymentStatusCheck = async (req, res) => {
    const { refNo, type } = req.body;

    if (!refNo || !type) {
        return res.status(500).json({ err: "Please provide type and ref no.", status: 'Invalid' })
    }

    function generateSecureHash(payload) {
        const secretKey = process.env.PAYMENT_SECRET_KEY;

        // Only keys that participate in hash
        const hashKeys = [
            "aggregatorID",
            "amount",
            "merchantId",
            "merchantTxnNo",
            "originalTxnNo",
            "transactionType"
        ];

        let hashString = "";

        hashKeys.forEach(key => {
            if (payload[key] !== undefined && payload[key] !== null) {
                hashString += String(payload[key]);
            }
        });

        return crypto
            .createHmac("sha256", secretKey)
            .update(hashString, "ascii")
            .digest("hex");
    }

    const checkStatusyRefNo = async ({ ref, amount, type, id, hotelId }) => {
        const payload = {
            "aggregatorID": process.env.AGGREGATOR_ID,
            "merchantId": process.env.MERCHANT_ID,
            "merchantTxnNo": ref,
            "originalTxnNo": ref,
            "amount": Number(amount).toFixed(2),
            "transactionType": "STATUS",
        }
        payload.secureHash = generateSecureHash(payload);

        const URL = process.env.CHECK_PAYMENT_STATUS;
        const payment = await fetch(URL, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const payResponse = await payment.json();
        const date = s => `${s?.slice(0, 4)}-${s?.slice(4, 6)}-${s?.slice(6, 8)}`;
        const time = s => `${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}`;


        // ONLY FOR DEVELOPER.......
        await payResponseModel.create({
            amenities_payment_id: id,
            amenities_hotel_id: hotelId,
            amenities_payment_ref_no: ref,
            amenities_payment_transaction_id: ref,
            amenities_transaction_type: type === "monthly" ? "0" : "1",
            amenities_transaction_details: JSON.stringify(payResponse)
        })

        let initTime;
        let oneHourCheck;
        if (type === "monthly") {
            const data = await amenitiesModel.find({ amenities_payment_ref_no: refNo, isDel: "0" });
            initTime = new Date(data.amenities_init_timestamp).getTime();
        } else if (type === "others") {
            const data = await otherPaymentModel.find({ other_payment_payment_ref_no: refNo, isDel: "0" });
            initTime = new Date(data.other_payment_init_timestamp).getTime();
        }

        const nowTime = Date.now();

        const oneHour = 60 * 60 * 1000;

        if (nowTime - initTime >= oneHour) {
            oneHourCheck = false;
        } else {
            oneHourCheck = true;
        }
        
        console.log("initals", data.amenities_init_timestamp)
        console.log("inittime", initTime)
        console.log("oneHourCheck", oneHourCheck)
        console.log("nowTime", nowTime)

        if (payResponse?.txnStatus === "REQ" || (initTime && oneHourCheck && payResponse?.responseCode === "P0030")) return 'Processing';

        else if (payResponse?.txnStatus === "SUC") {
            if (type === "monthly") {


                await amenitiesModel.updateOne({ amenities_payment_ref_no: refNo, isDel: "0" }, {
                    $set: {
                        amenities_payment_date: date(payResponse.paymentDateTime),
                        amenities_payment_time: time(payResponse.paymentDateTime),
                        amenities_payment_status: "1",
                        amenities_payment_transaction_id: payResponse.txnID,
                        amenities_transaction_details: JSON.stringify(payResponse),
                    }
                });
            }
            else if (type === "others") {
                await otherPaymentModel.updateOne({ other_payment_payment_ref_no: refNo, isDel: "0" }, {
                    $set: {
                        other_payment_payment_date: date(payResponse.paymentDateTime),
                        other_payment_payment_time: time(payResponse.paymentDateTime),
                        other_payment_payment_status: "1",
                        other_payment_payment_transaction_id: payResponse.txnID,
                        other_payment_transaction_details: JSON.stringify(payResponse),
                    }
                });
            }
            else {
                return "Invalid"
            }

            return "Success";
        }
        else if (payResponse?.txnStatus === "REJ" || payResponse?.txnStatus === "ERR") {

            if (type === "monthly") {
                await amenitiesModel.updateOne({ amenities_payment_ref_no: refNo, isDel: "0" }, {
                    $set: {
                        amenities_payment_date: new Date().toISOString().split("T")[0],
                        amenities_payment_status: "0",
                        amenities_transaction_details: JSON.stringify(payResponse),
                    }
                });
            }
            else if (type === "others") {
                await otherPaymentModel.updateOne({ other_payment_payment_ref_no: refNo, isDel: "0" }, {
                    $set: {
                        other_payment_payment_date: new Date().toISOString().split("T")[0],
                        other_payment_payment_status: "0",
                        other_payment_transaction_details: JSON.stringify(payResponse),
                    }
                });
            }
            else {
                return "Invalid"
            }

            return "Failed";
        }
        else {
            return "Invalid";
        }

    }

    try {
        let returnData = {
            status: ''
        };
        if (type === "monthly") {
            const checkStatus = await amenitiesModel.findOne({
                amenities_payment_ref_no: refNo,
                isDel: "0"
            })
            if (!checkStatus) {
                return res.status(400).json({ err: 'Unable to check', status: 'Invalid' });
            }


            if (checkStatus.amenities_payment_status === "0") {
                returnData.status = "Failed";
            }
            else if (checkStatus.amenities_payment_status === "1") {
                returnData.status = "Success";
            }
            else if (checkStatus.amenities_payment_status === "2") {
                const statusResult = await checkStatusyRefNo({
                    ref: refNo, amount: checkStatus.amenities_amount, type,
                    id: checkStatus._id, hotelId: checkStatus.amenities_hotel_id
                });
                returnData.status = statusResult;
            }
        }
        else if (type === 'others') {
            const checkStatus = await otherPaymentModel.findOne({
                other_payment_payment_ref_no: refNo,
                isDel: "0"
            })
            if (!checkStatus) {
                return res.status(400).json({ err: 'Unable to check', status: 'Invalid' });
            }

            if (checkStatus.other_payment_payment_status === "0") {
                returnData.status = "Failed";
            }
            else if (checkStatus.other_payment_payment_status === "1") {
                returnData.status = "Success";
            }
            else if (checkStatus.other_payment_payment_status === "2") {
                const statusResult = await checkStatusyRefNo({
                    ref: refNo, amount: checkStatus.other_payment_amount, type,
                    id: checkStatus._id, hotelId: checkStatus.other_payment_hotel_id
                });
                returnData.status = statusResult;
            }

        } else {
            return res.status(400).json({ err: 'Unable to check', status: 'Invalid' });
        }

        return res.status(200).json(returnData);


    } catch (error) {
        return res.status(500).json({ err: "Something went wrong", status: 'Invalid' })
    }
}


// USED FOR CRON
const autoStatusCheck = async () => {

    function generateSecureHash(payload) {
        const secretKey = process.env.PAYMENT_SECRET_KEY;

        // Only keys that participate in hash
        const hashKeys = [
            "aggregatorID",
            "amount",
            "merchantId",
            "merchantTxnNo",
            "originalTxnNo",
            "transactionType"
        ];

        let hashString = "";

        hashKeys.forEach(key => {
            if (payload[key] !== undefined && payload[key] !== null) {
                hashString += String(payload[key]);
            }
        });

        return crypto
            .createHmac("sha256", secretKey)
            .update(hashString, "ascii")
            .digest("hex");
    }

    const checkStatusyRefNo = async ({ ref, amount, type, id, hotelId }) => {
        const payload = {
            "aggregatorID": process.env.AGGREGATOR_ID,
            "merchantId": process.env.MERCHANT_ID,
            "merchantTxnNo": ref,
            "originalTxnNo": ref,
            "amount": Number(amount).toFixed(2),
            "transactionType": "STATUS",
        }
        payload.secureHash = generateSecureHash(payload);

        const URL = process.env.CHECK_PAYMENT_STATUS;
        const payment = await fetch(URL, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const payResponse = await payment.json();
        const date = s => `${s?.slice(0, 4)}-${s?.slice(4, 6)}-${s?.slice(6, 8)}`;


        // ONLY FOR DEVELOPER.......
        await payResponseModel.create({
            amenities_payment_id: id,
            amenities_hotel_id: hotelId,
            amenities_payment_ref_no: ref,
            amenities_payment_transaction_id: ref,
            amenities_transaction_type: type === "monthly" ? "0" : "1",
            amenities_transaction_details: JSON.stringify(payResponse)
        })


        if (payResponse?.txnStatus === "REQ") return 'Processing';

        else if (payResponse?.txnStatus === "SUC") {
            if (type === "monthly") {


                await amenitiesModel.updateOne({ amenities_payment_ref_no: refNo, isDel: "0" }, {
                    $set: {
                        amenities_payment_date: date(payResponse.paymentDateTime),
                        amenities_payment_status: "1",
                        amenities_payment_transaction_id: refNo,
                        amenities_transaction_details: JSON.stringify(payResponse),
                    }
                });
            }
            else if (type === "others") {
                await otherPaymentModel.updateOne({ other_payment_payment_ref_no: refNo, isDel: "0" }, {
                    $set: {
                        other_payment_payment_date: date(payResponse.paymentDateTime),
                        other_payment_payment_status: "1",
                        other_payment_payment_transaction_id: refNo,
                        other_payment_transaction_details: JSON.stringify(payResponse),
                    }
                });
            }
            else {
                return "Invalid"
            }

            return "Success";
        }
        else if (payResponse?.txnStatus === "REJ" || payResponse?.txnStatus === "ERR" || payResponse?.responseCode === "P0030") {

            if (type === "monthly") {
                await amenitiesModel.updateOne({ amenities_payment_ref_no: refNo, isDel: "0" }, {
                    $set: {
                        amenities_payment_date: date(payResponse.paymentDateTime),
                        amenities_payment_status: "0",
                        amenities_transaction_details: JSON.stringify(payResponse),
                    }
                });
            }
            else if (type === "others") {
                await otherPaymentModel.updateOne({ other_payment_payment_ref_no: refNo, isDel: "0" }, {
                    $set: {
                        other_payment_payment_date: date(payResponse.paymentDateTime),
                        other_payment_payment_status: "0",
                        other_payment_transaction_details: JSON.stringify(payResponse),
                    }
                });
            }
            else {
                return "Invalid"
            }

            return "Failed";
        }
        else {
            return "Invalid";
        }

    }

    // Get Amenities
    const getAmenities = await amenitiesModel.find({
        amenities_payment_status: "2",
        isDel: "0",
        amenities_payment_ref_no: { $exists: true, $ne: null, $ne: "" }
    });

    // Get Other payment
    const getOtherPayment = await otherPaymentModel.find({
        other_payment_payment_status: "2",
        isDel: '0',
        other_payment_payment_ref_no: { $exists: true, $ne: null, $ne: "" }
    })



    for (let amenities of getAmenities) {
        await checkStatusyRefNo({
            amount: amenities.amenities_amount,
            hotelId: amenities.amenities_hotel_id,
            id: amenities._id,
            ref: amenities.amenities_payment_ref_no,
            type: "monthly"
        })
    }

    for (let otherPayment of getOtherPayment) {
        await checkStatusyRefNo({
            amount: otherPayment.other_payment_amount,
            hotelId: otherPayment.other_payment_hotel_id,
            id: otherPayment._id,
            ref: otherPayment.other_payment_payment_ref_no,
            type: "others"
        })
    }

}


// Print Receipt
const printReceipt = async (req, res) => {
    const { type, id } = req.body;

    if (!type || !id) {
        return res.status(400).json({ err: "Please provide type and id" });
    }


    try {
        let data;

        if (type === "monthly") {
            data = await amenitiesModel.findOne({
                _id: new mongoose.Types.ObjectId(String(id)),
                amenities_payment_status: "1",
                isDel: "0"
            }).populate("amenities_hotel_id");
        } else if (type === "other") {
            data = await otherPaymentModel.findOne({
                _id: new mongoose.Types.ObjectId(String(id)),
                other_payment_payment_status: "1",
                isDel: "0"
            }).populate("other_payment_hotel_id");
        }

        if (!data) {
            return res.status(400).json({ err: "No payment record found" });
        }

        return res.status(200).json({ data: data });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ err: "Something went wrong" })
    }
}

module.exports = {
    paymentProcess,
    paymentStatusCheck,
    autoStatusCheck,
    printReceipt
}
