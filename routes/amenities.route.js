const router = require("express").Router();
const {
    addAmenities,
    getAmenities,
    updateAmenities
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


    
module.exports = router;
