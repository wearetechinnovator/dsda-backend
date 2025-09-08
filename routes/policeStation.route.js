const { update, get, deleteRecord, create, restore } = require("../controllers/policeStation.controller");
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

router
    .route("/restore")
    .post(restore);


module.exports = router;
