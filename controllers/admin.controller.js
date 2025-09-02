const adminModel = require("../models/admin.model");
const jwt = require("jsonwebtoken");
const jwtKey = process.env.JWT_KEY;
const bcryptJs = require("bcryptjs");
const connectRedis = require("../db/redis");



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


        return res.status(200).json({ token });

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
        designation, profile_picture, email, contact
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
            designation, profile_picture, email, contact
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


const get = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ err: 'Userid is required' })
    }

    try {
        const redisDB = await connectRedis();
        let userData;

        // Check cache;
        userData = await redisDB.get(userId);
        if (userData) {
            return res.status(200).json(JSON.parse(userData));
        }

        userData = await adminModel.findOne({ _id: userId }, { "password": 0 });

        if (!userData) {
            return res.status(404).json({ err: 'No user found' })
        }

        // Set cache
        await redisDB.setEx(userId, 120, JSON.stringify(userData));
        return res.status(200).json(userData);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ err: "Something went wrong" });
    }

}



module.exports = {
    login,
    create,
    get,
    checkToken
}