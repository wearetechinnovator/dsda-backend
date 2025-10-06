const adminModel = require("../models/admin.model");
const jwt = require("jsonwebtoken");
const jwtKey = process.env.JWT_KEY;
const bcryptJs = require("bcryptjs");
const connectRedis = require("../db/redis");
const crypto = require("crypto");
const https = require('https')
const fetch = require("node-fetch");



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
        const checkPass = await bcryptJs.compare(pass, admin.password);
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
        console.log(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

}


const checkToken = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ err: "token required" })
    }

    try {
        const decode = jwt.verify(token, jwtKey)

        if (!decode) {
            return res.status(401).json({ err: "Invalid token" });
        }

        res.status(200).json(decode)

    } catch (error) {
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
        const redisDB = await connectRedis();

        if (userId) {
            const cachedUser = await redisDB.get(`user:${userId}`);
            // if (cachedUser) {
            //     return res.status(200).json(JSON.parse(cachedUser));
            // }

            const userData = await adminModel.findOne(
                { _id: userId },
                { password: 0 }
            );

            if (!userData) {
                return res.status(404).json({ err: 'No user found' });
            }

            await redisDB.setEx(`user:${userId}`, 120, JSON.stringify(userData));

            return res.status(200).json(userData);
        }

        if (search) {
            const regex = new RegExp(search, "i");
            const data = await adminModel.find({ isDel: "0", name: regex })

            return res.status(200).json(data);
        }


        const cacheKey = `users:page=${page}:limit=${limit}`;
        // const cachedUsers = await redisDB.get(cacheKey);

        // if (cachedUsers) {
        //     return res.status(200).json(JSON.parse(cachedUsers));
        // }

        const users = await adminModel
            .find({ isDel: trash ? "1" : "0" }, { password: 0 })
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 });

        const totalCount = await adminModel.countDocuments({ isDel: trash ? "1" : "0" });

        const result = { data: users, total: totalCount, page, limit };

        await redisDB.setEx(cacheKey, 120, JSON.stringify(result));

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
        const result = await adminModel.updateMany(
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
        const result = await adminModel.updateMany(
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

const sendCheckinOTP = async (req, res) => {
    const { mobile, otp } = req.body;

    // --- MOBILE SMS OTP CODE (JavaScript version) ---
    const username = "WBDSDA"; // username of the department
    const password = "Admin12345@"; // password of the department
    const senderid = "WBDSDA"; // sender id of the department
    const message = `Your OTP for login to the System is ${ otp }. This OTP is valid for 60 seconds.Please do not share this OTP with others.`; // message content
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
        // const response = await axios.post(url, new URLSearchParams(data), {
        //     headers: {
        //         "Content-Type": "application/x-www-form-urlencoded",
        //     },
        //     httpsAgent: new (await import("https")).Agent({
        //         rejectUnauthorized: false, // equivalent to CURLOPT_SSL_VERIFYPEER = false
        //     }),
        // });

        const response = await fetch(url, {
            method: "POST",
            body: body,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            agent: agent,
        });

        console.log("SMS API Response:", response.data);
        return res.status(200).json(response.data)
    } catch (error) {
        console.error("Error sending OTP:", error.message);
        return null;
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
    sendCheckinOTP
}