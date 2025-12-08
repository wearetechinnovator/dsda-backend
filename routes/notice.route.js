const router = require('express').Router();
const { update, get,
    deleteRecord, restore,
    getHotelNotice, create
} = require('../controllers/notice.controller');
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
    .route("/get-hotel-notice")
    .post(middleware, getHotelNotice);

router
    .route("/delete")
    .post(middleware, deleteRecord);

router
    .route("/restore")
    .post(middleware, restore);



module.exports = router;
