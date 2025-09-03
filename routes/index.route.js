const router = require("express").Router();
const adminRoute = require("./admin.route");
const districtRoute = require("./district.route");
const blockRoute = require("./block.route");
const zoneRoute = require("./block.route");
const sectorRoute = require("./sector.route")
const policeStationRoute = require("./policeStation.route")


router.use("/admin", adminRoute);
router.use("/district", districtRoute);
router.use("/block", blockRoute);
router.use("/zone", zoneRoute);
router.use("/sector", sectorRoute);
router.use("/police-station", policeStationRoute);

module.exports = router;
