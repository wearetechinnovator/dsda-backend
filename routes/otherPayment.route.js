const {
    addPayment, getPayment,
    updatePayment
} = require("../controllers/otherPayment.controller");
const router = require("express").Router();



router
    .route("/add-payment")
    .post(addPayment);


router
    .route("/update-payment")
    .post(updatePayment);


router
    .route("/get-payment")
    .post(getPayment);




module.exports = router;
