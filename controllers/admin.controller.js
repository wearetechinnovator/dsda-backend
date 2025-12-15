const adminModel = require("../models/admin.model");
const jwt = require("jsonwebtoken");
const jwtKey = process.env.JWT_KEY;
const HOTEL_JWT_KEY = process.env.HOTEL_JWT_KEY; 
const bcryptJs = require("bcryptjs");
const crypto = require("crypto");
const https = require('https')
const fetch = require("node-fetch");
const hotelModel = require("../models/hotel.model");
const amenitiesModel = require("../models/amenities.model");




const login = async (req, res) => {
    const { email, pass } = req.body;

    if (!email || !pass) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {
        const admin = await adminModel.findOne({ $and: [{ email: email }, { isDel: '0' }] });
        if (!admin) {
            return res.status(401).json({ err: 'Incorrect email or password' })
        }

        // Check password;
        const checkPass = bcryptJs.compare(pass, admin.password);
        if (!checkPass) {
            return res.status(401).json({ err: 'Incorrect email or password' })
        }


        // Update IP and DateTime;
        const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
        const dateTime = new Date().toLocaleString();

        await adminModel.updateOne({ _id: admin._id }, {
            $set: {
                last_login_ip: ip,
                last_login_date_time: dateTime
            }
        })


        // Create token;
        const token = jwt.sign({
            email: admin.email, name: admin.name, id: admin._id
        }, jwtKey);


        return res.status(200).json({ token, userId: admin._id });

    } catch (error) {
         
        return res.status(500).json({ err: "Something went wrong" });
    }

}


const checkToken = async (req, res) => {
    const { token, hotelToken } = req.body;

    if (!token && !hotelToken) {
        return res.status(400).json({ err: "token required" })
    }

    try {
        let decode;
        if (token) {
            decode = jwt.verify(token, jwtKey);
        }else{
            decode = jwt.verify(hotelToken, HOTEL_JWT_KEY);
        }

        if (!decode) {
            return res.status(401).json({ err: "Invalid token" });
        }

        res.status(200).json(decode)

    } catch (error) {
         
        return res.status(500).json({ err: "Something went wrong" });
    }
}


const create = async (req, res) => {
    const { name, password, role,
        designation, profile, email, contact
    } = req.body;

    if ([name, password, role, designation, email, contact].some(field => !field || field === "")) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {
        // Check existence;
        const exist = await adminModel.findOne({ email });
        if (exist) {
            return res.status(409).json({ err: 'User already exists' })
        }

        // hash password
        const hasPass = await bcryptJs.hash(password, 13);

        const insert = await adminModel.create({
            name, password: hasPass, role,
            designation, profile_picture: profile, email, contact
        });

        if (!insert) {
            return res.status(401).json({ err: 'User creation failed' })
        }

        return res.status(200).json(insert);

    } catch (error) {
         
        return res.status(500).json({ err: "Something went wrong" });
    }

}


const changePass = async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {
        const admin = await adminModel.findOne({ _id: userId });
        if (!admin) {
            return res.status(404).json({ err: 'User not found' });
        }

        const checkPass = await bcryptJs.compare(currentPassword, admin.password);
        if (!checkPass) {
            return res.status(401).json({ err: 'Incorrect current password' });
        }

        // Proceed with password change
        const newHashedPass = await bcryptJs.hash(newPassword, 13);
        await adminModel.updateOne({ _id: userId }, { $set: { password: newHashedPass } });

        return res.status(200).json({ msg: 'Password changed successfully' });

    } catch (error) {
         
        return res.status(500).json({ err: "Something went wrong" });
    }
}


const update = async (req, res) => {
    const { userId, name, password, role,
        designation, profile, email, contact
    } = req.body;


    if ([name, role, designation, email, contact].some(field => !field || field === "")) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }


    try {
        const updateData = {
            name, role, designation, profile_picture: profile, email, contact
        };
        if (password) {
            const hasPass = await bcryptJs.hash(password, 13);
            updateData.password = hasPass;
        }

        const result = await adminModel.updateOne({ _id: userId }, { $set: updateData })

        if (result.modifiedCount === 0) {
            return res.status(304).json({ msg: 'No changes applied' });
        }

        return res.status(200).json(result);

    } catch (error) {
         
        return res.status(500).json({ err: "Something went wrong" });
    }

}


const get = async (req, res) => {
    const userId = req.body?.userId;
    const limit = req.body?.limit ?? 10;
    const page = req.body?.page ?? 1;
    const trash = req.body?.trash;
    const search = req.body?.search?.trim();

    const skip = (page - 1) * limit;

    try {

        if (userId) {

            const userData = await adminModel.findOne(
                { _id: userId },
                { password: 0 }
            );

            if (!userData) {
                return res.status(404).json({ err: 'No user found' });
            }

            return res.status(200).json(userData);
        }

        if (search) {
            const regex = new RegExp(search, "i");
            const data = await adminModel.find({ isDel: "0", name: regex })

            return res.status(200).json(data);
        }
     

        const users = await adminModel
            .find({ isDel: trash ? "1" : "0" }, { password: 0 })
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 });

        const totalCount = await adminModel.countDocuments({ isDel: trash ? "1" : "0" });

        const result = { data: users, total: totalCount, page, limit };

        return res.status(200).json(result);

    } catch (error) {
        
        return res.status(500).json({ err: "Something went wrong" });
    }
};


const deleteRecord = async (req, res) => {
    const { ids, trash } = req.body;

    if (!ids || ids.length === 0) {
        return res.status(400).json({ err: 'Please provide record ids' });
    }

    try {
        const result = await adminModel.updateMany(
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


const restore = async (req, res) => {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
        return res.status(400).json({ err: 'Please provide record ids' });
    }

    try {
        const result = await adminModel.updateMany(
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


const sendCheckinOTP = async (req, res) => {
    const { mobile, otp } = req.body;

    // --- MOBILE SMS OTP CODE (JavaScript version) ---
    const username = "WBDSDA"; // username of the department
    const password = "Admin#123"; // password of the department
    const senderid = "WBDSDA"; // sender id of the department
    const message = `Your OTP for login to the System is ${otp}. This OTP is valid for 60 seconds.Please do not share this OTP with others.`; // message content
    const mobileno = mobile; // single number
    const deptSecureKey = "9a6e9fff-02d5-4275-99f8-9992b04e7580"; // department secure key
    const templateid = "1407168381302798926";

    // Encrypt password (SHA1)
    const encryptedPassword = crypto
        .createHash("sha1")
        .update(password.trim())
        .digest("hex");


    // Generate key (SHA512)
    const key = crypto
        .createHash("sha512")
        .update(
            username.trim() +
            senderid.trim() +
            message.trim() +
            deptSecureKey.trim()
        )
        .digest("hex");

    // Prepare data
    const data = {
        username: username.trim(),
        password: encryptedPassword.trim(),
        senderid: senderid.trim(),
        content: message.trim(),
        smsservicetype: "otpmsg",
        mobileno: mobileno.trim(),
        key: key.trim(),
        templateid: templateid.trim(),
    };

    const body = new URLSearchParams(data);
    const agent = new https.Agent({ rejectUnauthorized: false });
    const url = "https://msdgweb.mgov.gov.in/esms/sendsmsrequestDLT";

    try {

        const response = await fetch(url, {
            method: "POST",
            body: body,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            agent: agent
        });


        return res.status(200).json(response)
    } catch (error) {
        console.error("Error sending OTP:", error.message);
        return null;
    }
}


// Get statictics data;
const getStats = async (req, res) => {
    try {

        const [countOfHotels, operativeHotels, totalBeds, totalAmenities] = await Promise.all([
            await hotelModel.countDocuments({ IsDel: '0' }),
            await hotelModel.countDocuments({ hotel_status: "1", IsDel: '0' }),
            await hotelModel.aggregate([
                {
                    $match: { IsDel: "0" }
                },
                {
                    $group: {
                        _id: null,
                        totalBedSum: {
                            $sum: { $toInt: "$hotel_total_bed" }
                        }
                    }
                }
            ]),

            await amenitiesModel.aggregate([
                {
                    $match: {
                        isDel: "0",
                        amenities_payment_status: "1"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmenitiesAmount: {
                            $sum: { $toDouble: "$amenities_amount" }
                        }
                    }
                }
            ])

        ]);


        res.status(200).json({
            total_hotel: countOfHotels,
            total_operative_hotel: operativeHotels,
            total_beds: totalBeds[0]?.totalBedSum || 0,
            total_amenities_paid: totalAmenities[0]?.totalAmenitiesAmount || 0
        })

    } catch (error) {
        
        return res.status(500).json({ err: "Something went wrong" });
    }
}



module.exports = {
    login,
    create,
    get,
    checkToken,
    update,
    deleteRecord,
    restore,
    changePass,
    sendCheckinOTP,
    getStats
}