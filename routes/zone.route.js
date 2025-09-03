const { update, get, deleteRecord, create } = require("../controllers/zone.controller");
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

router
    .route("/delete")
    .post(deleteRecord);


module.exports = router;
