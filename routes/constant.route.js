const { get } = require("../controllers/constant.controller");
const router = require("express").Router();
const middleware = require("../middleware/middleware");


router
    .route("/get/:which")
    .get(middleware, get);


module.exports = router;