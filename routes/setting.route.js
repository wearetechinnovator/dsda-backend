const { update, get, create } = require("../controllers/setting.controller");
const router = require("express").Router();



router
    .route("/create")
    .post(create);

router
    .route("/update")
    .post(update);

router
    .route("/get")
    .post(get);



module.exports = router;
