const { update, get, create } = require("../controllers/setting.controller");
const router = require("express").Router();
const middleware = require("../middleware/middleware");


router
    .route("/create")
    .post(middleware, create);

router
    .route("/update")
    .post(middleware, update);

router
    .route("/get")
    .post(middleware, get);



module.exports = router;
