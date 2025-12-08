const {
    addPayment,
    getPayment,
    updatePayment,
    deletePayment,
    restorePayment
} = require("../controllers/otherPayment.controller");
const router = require("express").Router();
const middleware = require("../middleware/middleware");


router
    .route("/add-payment")
    .post(middleware, addPayment);


router
    .route("/update-payment")
    .post(middleware, updatePayment);


router
    .route("/get-payment")
    .post(middleware, getPayment);


router
    .route("/delete")
    .post(middleware, deletePayment);


router
    .route("/restore")
    .post(middleware, restorePayment);



module.exports = router;
