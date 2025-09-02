const router = require("express").Router();
const adminRoute = require("./admin.route");



router.use("/admin", adminRoute);



module.exports = router;