const router = require('express').Router();
const { update, get,
    deleteRecord, restore,
    getHotelNotice, create
} = require('../controllers/notice.controller');



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
    .route("/get-hotel-notice")
    .post(getHotelNotice);

router
    .route("/delete")
    .post(deleteRecord);

router
    .route("/restore")
    .post(restore);



module.exports = router;
