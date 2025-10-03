const router = require("express").Router();
const adminRoute = require("./admin.route");
const districtRoute = require("./district.route");
const blockRoute = require("./block.route");
const zoneRoute = require("./zone.route");
const sectorRoute = require("./sector.route")
const policeStationRoute = require("./policeStation.route");
const settingRoute = require("./setting.route");
const constantRoute = require("./constant.route");
const hotelRoute = require("./hotel.route");
const notieRoute = require("./notice.route");


router.use("/admin", adminRoute);
router.use("/district", districtRoute);
router.use("/block", blockRoute);
router.use("/zone", zoneRoute);
router.use("/sector", sectorRoute);
router.use("/police-station", policeStationRoute);
router.use("/site-setting", settingRoute);
router.use("/constant-type", constantRoute);
router.use("/hotel", hotelRoute);
router.use("/notice", notieRoute);


module.exports = router;
