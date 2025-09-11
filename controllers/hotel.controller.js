const hotelModel = require("../models/hotel.model");



const create = async (req, res) => {
  try {
    const {zone, sector, block, category, district, policeStation, name, address, 
    email,establishment, miniumRate, maximumRate, website, gmbUrl, distanceFromRoad,
    distanceFromSeaBeach, ac,swimingPool, parkingAvailable,
    username, password, receptionPhone, proprietorName, proprietorPhone, managerName,
    managerPhone, alternateManagerPhone, restaurantAvailable, conferanceHallAvailable,
    status
    } = req.body;


    if ([name, district, zone, sector, policeStation].some(field => !field || field === "")) {
      return res.status(400).json({ err: "Hotel name is required" });
    }

    const exist = await hotelModel.findOne({ hotel_name: name });
    if (exist) {
      return res.status(409).json({ err: "Hotel already exists" });
    }


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
      hotel_has_ac: ac,
      hotel_has_swiming_pool: swimingPool,
      hotel_has_restaurant: restaurantAvailable,
      hotel_has_conference_hall: conferanceHallAvailable,
      hotel_has_parking: parkingAvailable,
      hotel_username: username,
      hotel_password: password,
      hotel_reception_phone: receptionPhone,
      hotel_proprietor_name: proprietorName,
      hotel_proprietor_phone: proprietorPhone,
      hotel_manager_name: managerName,
      hotel_manager_phone: managerPhone,
      hotel_manager_phone_alternative: alternateManagerPhone,
      hotel_status: status || "0",
    });

    if (!insert) {
      return res.status(401).json({ err: "Hotel creation failed" });
    }

    return res.status(201).json(insert);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "Something went wrong" });
  }
};


module.exports = {
    create,
}
