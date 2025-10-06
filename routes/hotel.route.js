const { create, get, update, deleteRecord, restore, login, changePassword } = require("../controllers/hotel.controller");
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


router
    .route("/change-password")
    .post(changePassword);


module.exports = router;
