const router = require("express").Router();
const {
    addAmenities,
    getAmenities,
    updateAmenities,
    getTotalAmenityPay
} = require("../controllers/amenities.controller");
const middleware = require("../middleware/middleware");



// testing purpose only this route;
router
    .route("/amenities-sync")
    .post(middleware, addAmenities);


router
    .route("/get-amenities")
    .post(middleware, getAmenities);


router
    .route("/update-amenities")
    .post(middleware, updateAmenities);

    
router
    .route("/get-total-amenities-pay")
    .post(middleware, getTotalAmenityPay);


    
module.exports = router;
