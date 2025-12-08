const {
    create, get, update, deleteRecord,
    restore, login, changePassword
} = require("../controllers/hotel.controller");
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

router
    .route("/delete")
    .post(middleware, deleteRecord);

router
    .route("/restore")
    .post(middleware, restore);

router
    .route("/login")
    .post(login);


router
    .route("/change-password")
    .post(middleware, changePassword);


module.exports = router;
