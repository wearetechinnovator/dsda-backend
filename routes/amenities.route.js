const router = require("express").Router();
const {
    addAmenities,
    getAmenities,
    updateAmenities,
    getTotalAmenityPay
} = require("../controllers/amenities.controller");



router
    .route("/amenities-sync")
    .post(addAmenities);


router
    .route("/get-amenities")
    .post(getAmenities);


router
    .route("/update-amenities")
    .post(updateAmenities);

router
    .route("/get-total-amenities-pay")
    .post(getTotalAmenityPay);


    
module.exports = router;
