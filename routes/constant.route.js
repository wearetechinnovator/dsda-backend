const { get } = require("../controllers/constant.controller");
const router = require("express").Router();


router
    .route("/get/:which")
    .get(get);


module.exports = router;