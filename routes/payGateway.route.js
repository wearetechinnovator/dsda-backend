const { paymentProcess, paymentStatusCheck } = require("../controllers/payGateway.controller");
const router = require("express").Router();
const middleware = require("../middleware/middleware");

router
    .route("/process")
    .post(middleware, paymentProcess);


router
    .route("/check-status")
    .post(middleware, paymentStatusCheck);



module.exports = router;