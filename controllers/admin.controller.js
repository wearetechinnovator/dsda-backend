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

const update = async (req, res) => {
    const { userId, name, password, role,
        designation, profile_picture, email, contact
    } = req.body;

    if ([name, role, designation, email, contact].some(field => !field || field === "")) {
        return res.status(400).json({ err: 'Please fill the requires' })
    }

    try {
        const updateData = {
            name, role, designation, profile_picture, email, contact
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

    const skip = (page - 1) * limit;

    try {
        const redisDB = await connectRedis();

        if (userId) {
            const cachedUser = await redisDB.get(`user:${userId}`);
            if (cachedUser) {
                return res.status(200).json(JSON.parse(cachedUser));
            }

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


        const cacheKey = `users:page=${page}:limit=${limit}`;
        const cachedUsers = await redisDB.get(cacheKey);

        if (cachedUsers) {
            return res.status(200).json(JSON.parse(cachedUsers));
        }

        const users = await adminModel
            .find({}, { password: 0 })
            .skip(skip)
            .limit(limit);

        const totalCount = await adminModel.countDocuments({ isDel: "0" });

        const result = { data: users, total: totalCount, page, limit };

        await redisDB.setEx(cacheKey, 120, JSON.stringify(result));

        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "Something went wrong" });
    }
};

const deleteRecord = async (req, res) => {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
        return res.status(400).json({ err: 'Please provide record ids' });
    }

    try {
        const result = await adminModel.updateMany(
            { _id: { $in: ids } },
            { $set: { isDel: "1" } }
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




module.exports = {
    login,
    create,
    get,
    checkToken,
    update,
    deleteRecord
}