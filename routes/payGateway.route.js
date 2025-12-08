const { paymentProcess, paymentConfirm } = require("../controllers/payGateway.controller");
const router = require("express").Router();
const middleware = require("../middleware/middleware");

router
    .route("/process")
    .post(middleware, paymentProcess);


router
    .route("/confirm")
    .post(middleware, paymentConfirm);



module.exports = router;