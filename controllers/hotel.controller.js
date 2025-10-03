const bcryptJs = require("bcryptjs");
const hotelModel = require("../models/hotel.model");
const connectRedis = require("../db/redis");
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_KEY;


const login = async (req, res) => {
  const { username, password, adminToken } = req.body;


  if (adminToken) {
    if (!username) {
      return res.status(400).json({ err: 'Please fill the requires' })
    }

    const decoded = jwt.verify(adminToken, jwtKey);
    if (!decoded) {
      return res.status(401).json({ err: 'Invalid admin token' });
    }

  } else {
    if ([username, password].some(field => !field || field === "")) {
      return res.status(400).json({ err: 'Please fill the requires' })
    }
  }


  try {
    const hotel = await hotelModel.findOne({ hotel_username: username }, { password: 0 });
    if (!hotel) {
      return res.status(404).json({ err: 'User not found' });
    }

    if (password) {
      const isMatch = await bcryptJs.compare(password, hotel.hotel_password);
      if (!isMatch) {
        return res.status(401).json({ err: 'Invalid credentials' });
      }
    }

    // Generate JWT token
    const token = jwt.sign({ id: hotel._id }, jwtKey);
    return res.status(200).json({ hotel, token });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: "Something went wrong" });
  }
}


const create = async (req, res) => {
  try {
    const { zone, sector, block, category, district, policeStation, name, address,
      email, establishment, miniumRate, maximumRate, website, gmbUrl, distanceFromRoad,
      distanceFromSeaBeach, ac, swimingPool, parkingAvailable,
      username, password, receptionPhone, proprietorName, proprietorPhone, managerName,
      managerPhone, alternateManagerPhone, restaurantAvailable, conferanceHallAvailable,
      status, oneBed, twoBed, threeBed, fourBed, fiveBed, sixBed,
      sevenBed, eightBed, nineBed, tenBed, totalBed, totalRoom,
      photoGallery, documentData, roomTypeData, swimmingPool
    } = req.body;


    if ([name, district, zone, sector, policeStation, username, password].some(field => !field || field === "")) {
      return res.status(400).json({ err: "fill the required" });
    }

    const exist = await hotelModel.findOne({ hotel_username: username });
    if (exist) {
      return res.status(409).json({ err: "Username already exists" });
    }

    // Hash Password;
    const hashPassword = await bcryptJs.hash(password, 10);

    const insert = await hotelModel.create({
      hotel_name: name,
      hotel_category: category,
      hotel_zone_id: zone,
      hotel_sector_id: sector,
      hotel_block_id: block,
      hotel_police_station_id: policeStation,
      hotel_district_id: district,
      hotel_address: address,
      hotel_email: email,
      hotel_year_of_establishment: establishment,
      hotel_minimum_rate: miniumRate,
      hotel_maximum_rate: maximumRate,
      hotel_website: website,
      hotel_gmb: gmbUrl,
      hotel_distance_from_main_road: distanceFromRoad,
      hotel_distance_from_sea_beach: distanceFromSeaBeach,
      hotel_has_ac: ac || "0",
      hotel_has_swimming_pool: swimmingPool || "0",
      hotel_has_restaurant: restaurantAvailable || "0",
      hotel_has_conference_hall: conferanceHallAvailable || "0",
      hotel_has_parking: parkingAvailable || "0",
      hotel_username: username,
      hotel_password: hashPassword,
      hotel_reception_phone: receptionPhone,
      hotel_proprietor_name: proprietorName,
      hotel_proprietor_phone: proprietorPhone,
      hotel_manager_name: managerName,
      hotel_manager_phone: managerPhone,
      hotel_manager_phone_alternative: alternateManagerPhone,
      hotel_status: status || "1",
      hotel_1_bed_room: oneBed,
      hotel_2_bed_room: twoBed,
      hotel_3_bed_room: threeBed,
      hotel_4_bed_room: fourBed,
      hotel_5_bed_room: fiveBed,
      hotel_6_bed_room: sixBed,
      hotel_7_bed_room: sevenBed,
      hotel_8_bed_room: eightBed,
      hotel_9_bed_room: nineBed,
      hotel_10_bed_room: tenBed,
      hotel_total_bed: totalBed,
      hotel_total_room: totalRoom,
      hotel_gallery_image: photoGallery,
      hotel_document: documentData,
      hotel_room_type: roomTypeData
    });

    if (!insert) {
      return res.status(401).json({ err: "Hotel creation failed" });
    }

    return res.status(200).json(insert);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "Something went wrong" });
  }
};


const update = async (req, res) => {
  const { id, zone, sector, block, category, district, policeStation, name, address,
    email, establishment, miniumRate, maximumRate, website, gmbUrl, distanceFromRoad,
    distanceFromSeaBeach, ac, parkingAvailable,
    username, password, receptionPhone, proprietorName, proprietorPhone, managerName,
    managerPhone, alternateManagerPhone, restaurantAvailable, conferanceHallAvailable,
    status, oneBed, twoBed, threeBed, fourBed, fiveBed, sixBed,
    sevenBed, eightBed, nineBed, tenBed, totalBed, totalRoom, swimmingPool,
    photoGallery, documentData, roomTypeData } = req.body;

  if ([name, district, zone, sector, policeStation, username, password].some(field => !field || field === "")) {
    return res.status(400).json({ err: 'Please fill the requires' })
  }

  const exist = await hotelModel.findOne({ $and: [{ hotel_username: username }, { _id: { $ne: id } }] });
  if (exist) {
    return res.status(409).json({ err: "Username already exists" });
  }

  // Hash Password;
  const hashPassword = await bcryptJs.hash(password, 10);

  // Update Hotel
  try {
    const result = await hotelModel.updateOne({ _id: id }, {
      $set: {
        hotel_name: name,
        hotel_category: category,
        hotel_zone_id: zone,
        hotel_sector_id: sector,
        hotel_block_id: block,
        hotel_police_station_id: policeStation,
        hotel_district_id: district,
        hotel_address: address,
        hotel_email: email,
        hotel_year_of_establishment: establishment,
        hotel_minimum_rate: miniumRate,
        hotel_maximum_rate: maximumRate,
        hotel_website: website,
        hotel_gmb: gmbUrl,
        hotel_distance_from_main_road: distanceFromRoad,
        hotel_distance_from_sea_beach: distanceFromSeaBeach,
        hotel_has_ac: ac || "0",
        hotel_has_swimming_pool: swimmingPool,
        hotel_has_restaurant: restaurantAvailable || "0",
        hotel_has_conference_hall: conferanceHallAvailable || "0",
        hotel_has_parking: parkingAvailable || "0",
        hotel_username: username,
        hotel_password: hashPassword,
        hotel_reception_phone: receptionPhone,
        hotel_proprietor_name: proprietorName,
        hotel_proprietor_phone: proprietorPhone,
        hotel_manager_name: managerName,
        hotel_manager_phone: managerPhone,
        hotel_manager_phone_alternative: alternateManagerPhone,
        hotel_status: status || "1",
        hotel_1_bed_room: oneBed,
        hotel_2_bed_room: twoBed,
        hotel_3_bed_room: threeBed,
        hotel_4_bed_room: fourBed,
        hotel_5_bed_room: fiveBed,
        hotel_6_bed_room: sixBed,
        hotel_7_bed_room: sevenBed,
        hotel_8_bed_room: eightBed,
        hotel_9_bed_room: nineBed,
        hotel_10_bed_room: tenBed,
        hotel_total_bed: totalBed,
        hotel_total_room: totalRoom,
        hotel_gallery_image: photoGallery,
        hotel_document: documentData,
        hotel_room_type: roomTypeData
      }
    })

    if (result.modifiedCount === 0) {
      return res.status(304).json({ msg: 'No changes applied' });
    }

    return res.status(200).json({ msg: "Hotel updated successfully" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: "Something went wrong" });
  }

}


const get = async (req, res) => {
  const id = req.body?.id;
  const limit = req.body?.limit ?? 10;
  const page = req.body?.page ?? 1;
  const search = req.body?.search?.trim();
  const trash = req.body?.trash;

  const skip = (page - 1) * limit;

  try {
    const redisDB = await connectRedis();

    if (id) {
      const data = await hotelModel.findOne({ _id: id, IsDel: "0" })
        .populate('hotel_sector_id').populate('hotel_zone_id').populate('hotel_district_id').populate('hotel_police_station_id').populate('hotel_category');
      if (!data) {
        return res.status(404).json({ err: 'No data found' });
      }

      return res.status(200).json(data);
    }

    if (search) {
      const regex = new RegExp(search, "i");
      const data = await hotelModel.find({ IsDel: "0", name: regex }).populate('hotel_sector_id').populate('hotel_zone_id').populate('hotel_district_id').populate('hotel_police_station_id').populat('hotel_category')

      return res.status(200).json(data);
    }


    const cacheKey = `hotel:page=${page}:limit=${limit}`;
    // const cachedUsers = await redisDB.get(cacheKey);

    // if (cachedUsers) {
    //     return res.status(200).json(JSON.parse(cachedUsers));
    // }

    const data = await hotelModel.find({ IsDel: trash ? "1" : "0" })
      .skip(skip).limit(limit).sort({ _id: -1 })
      .populate('hotel_sector_id')
      .populate('hotel_zone_id')
      .populate('hotel_district_id')
      .populate('hotel_police_station_id')
      .populate('hotel_category');
    const totalCount = await hotelModel.countDocuments({ IsDel: trash ? "1" : "0" });

    const result = { data: data, total: totalCount, page, limit };

    await redisDB.setEx(cacheKey, 5, JSON.stringify(result));

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
    const result = await hotelModel.updateMany(
      { _id: { $in: ids } },
      { $set: { IsDel: trash ? "1" : "2" } }
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
    const result = await hotelModel.updateMany(
      { _id: { $in: ids } },
      { $set: { IsDel: "0" } }
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




module.exports = {
  create,
  get,
  update,
  restore,
  deleteRecord,
  login
};

