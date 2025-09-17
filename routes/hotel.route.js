const { create, get, update, deleteRecord, restore, login } = require("../controllers/hotel.controller");
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

router
    .route("/login")
    .post(login);

module.exports = router;
