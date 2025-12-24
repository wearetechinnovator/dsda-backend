const crypto = require("crypto");
const amenitiesModel = require("../models/amenities.model");
const otherPaymentModel = require("../models/otherPayment.model");
const fetch = require("node-fetch");


// const paymentProcess = async (req, res) => {
//     const { id, type } = req.body;

//     if (!id || !type) {
//         return res.status(500).json({ err: "Please provide data" })
//     }

//     // ENCRYPT DATA;
//     function aes128Encrypt(str) {
//         const key = "3725642567501001"; // 16 bytes
//         const cipher = crypto.createCipheriv(
//             'aes-128-ecb',
//             Buffer.from(key, 'utf8'),
//             null // ECB has no IV
//         );

//         cipher.setAutoPadding(true); // same as PKCS7

//         let encrypted = cipher.update(str, 'utf8', 'base64');
//         encrypted += cipher.final('base64');

//         return encrypted;
//     }

//     try {
//         const PAY_URL = "https://eazypay.icicibank.com/EazyPG?";
//         const MERCHANT_ID = "376758";
//         const REFERENCE_NO = String(Date.now() + (Math.floor(Math.random() * 9) + 1));
//         let SUB_MERCHANT_ID, AMOUNT, HOTEL_ID, HOTEL_NAME, YEAR, MONTH, PAYMENT_ID, TYPE = type;


//         if (type === "others") {

//             // UPDAET OHTER PAYMENT TABLE;
//             await otherPaymentModel.updateOne({_id: id}, {
//                 $set: {
//                     other_payment_payment_init:"1",
//                     other_payment_payment_status:"2",
//                     other_payment_payment_ref_no: REFERENCE_NO
//                 }
//             });

//             const payDetails = await otherPaymentModel.findOne({ _id: id }).populate('other_payment_hotel_id');
//             SUB_MERCHANT_ID = String(payDetails.other_payment_hotel_id._id);
//             AMOUNT = String(payDetails.other_payment_amount);
//             HOTEL_ID = String(payDetails.other_payment_hotel_id._id);
//             HOTEL_NAME = payDetails.other_payment_hotel_id.hotel_name;
//             YEAR = "ADDITIONAL FIELD1";
//             MONTH = "ADDITIONAL FIELD2";
//             PAYMENT_ID = String(id);
//         }


//         if (type === "monthly") {

//             // UPDAET AMENITY TABLE;
//             await amenitiesModel.updateOne({_id: id}, {
//                 $set: {
//                     amenities_payment_init:"1",
//                     amenities_payment_status:"2",
//                     amenities_payment_ref_no: REFERENCE_NO
//                 }
//             });


//             const payDetails = await amenitiesModel.findOne({ _id: id }).populate('amenities_hotel_id');
//             SUB_MERCHANT_ID = String(payDetails.amenities_hotel_id._id);
//             AMOUNT = String(payDetails.amenities_amount);
//             HOTEL_ID = String(payDetails.amenities_hotel_id._id);
//             HOTEL_NAME = payDetails.amenities_hotel_id.hotel_name;
//             YEAR = String(payDetails.amenities_year);
//             MONTH = String(payDetails.amenities_month);
//             PAYMENT_ID = String(id);
//         }


//         // Encrypt required fields
//         const MANDATORY_FIELDS = aes128Encrypt(`${REFERENCE_NO}|${SUB_MERCHANT_ID}|${AMOUNT}|${HOTEL_ID}|${HOTEL_NAME}`);
//         const OPTIONAL_FIELDS = aes128Encrypt(`${YEAR}|${MONTH}|${PAYMENT_ID}|${TYPE}|ADDITIONALFIELD5`);
//         const RETURN_URL = aes128Encrypt("https://dsda.org.in/swagata/hotel/booking/confirmPayment");
//         const ENC_REFERENCE_NO = aes128Encrypt(REFERENCE_NO);
//         const ENC_SUB_MERCHANT_ID = aes128Encrypt(SUB_MERCHANT_ID);
//         const TRANSACTION_AMOUNT = aes128Encrypt(AMOUNT);
//         const PAY_MODE = aes128Encrypt("9");

//         // Construct final payment URL
//         const FINAL_URL =
//             `${PAY_URL}` +
//             `merchantid=${MERCHANT_ID}` +
//             `&mandatory fields=${encodeURIComponent(MANDATORY_FIELDS)}` +
//             `&optional fields=${encodeURIComponent(OPTIONAL_FIELDS)}` +
//             `&returnurl=${encodeURIComponent(RETURN_URL)}` +
//             `&Reference No=${encodeURIComponent(ENC_REFERENCE_NO)}` +
//             `&submerchantid=${encodeURIComponent(ENC_SUB_MERCHANT_ID)}` +
//             `&transaction amount=${encodeURIComponent(TRANSACTION_AMOUNT)}` +
//             `&paymode=${encodeURIComponent(PAY_MODE)}`;

//         if (!FINAL_URL) {
//             return res.status(500).json({ err: 'URL NOT FOUND' })
//         }

//         return res.status(200).json({ url: FINAL_URL })

//     } catch (error) {

//         return res.status(500).json({ err: "Something went wrong" })
//     }
// }



const paymentProcess = async (req, res) => {
    const { id, type } = req.body;

    if (!id || !type) {
        return res.status(500).json({ err: "Please provide data" })
    }

    function generateSecureHash(payload) {
        const secretKey = "ae85111d-7cc7-4f75-b0dd-6ebd33f8a86f";

        const hashString =
            payload.addlParam1 +
            payload.addlParam2 +
            payload.amount +
            payload.currencyCode +
            payload.customerEmailID +
            payload.customerMobileNo +
            payload.customerName +
            payload.merchantId +
            payload.merchantTxnNo +
            payload.payType +
            payload.returnURL +
            payload.transactionType +
            payload.txnDate +
            secretKey;

        console.log("HASH TEXT ===>", hashString);
        return crypto
            .createHash("sha256")
            .update(hashString)
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

    try {
        const URL = "https://pgpayuat.icicibank.com/tsp/pg/api/v2/initiateSale";
        const payload = {
            "merchantId": "100000000007164",
            "aggregatorID": "A100000000007164",
            // "merchantTxnNo": "757585887575",
            "merchantTxnNo": Date.now().toString(),
            "amount": "100.00",
            "currencyCode": "356",
            "payType": "0",
            "customerEmailID": "test@gmail.com",
            "transactionType": "SALE",
            "returnURL": "https://13.204.230.47:8080/pay-gateway/confirm",
            // "returnURL": "https://pgpayuat.icicibank.com/tsp/pg/api/merchant",
            // "txnDate": "20241121115413",
            "txnDate": getTxnDate(),
            "customerMobileNo": "917709356672",
            "customerName": "Narayan",
            "addlParam1": "000",
            "addlParam2": "111"
        };

        payload.secureHash = generateSecureHash(payload);

        console.log("FINAL PAYLOAD ===>", payload);

        const payment = await fetch(URL, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const payResponse = await payment.json();

        if (payResponse.responseCode !== "0000") {
            return res.status(400).json(payResponse);
        }

        res.json({
            redirectURI: payResponse.redirectURI,
            tranCtx: payResponse.tranCtx
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ err: "Something went wrong" })
    }
}


const paymentRedirect = async (req, res) => {
    const payment = req.body;

    res.send(payment)

}


const paymentConfirm = async (req, res) => {
    res.send("payment-confirm")

}


module.exports = {
    paymentProcess,
    paymentConfirm,
    paymentRedirect
}