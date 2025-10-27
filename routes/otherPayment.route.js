const {
    addPayment,
    getPayment,
    updatePayment,
    deletePayment,
    restorePayment
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


router
    .route("/delete")
    .post(deletePayment);


router
    .route("/restore")
    .post(restorePayment);



module.exports = router;
