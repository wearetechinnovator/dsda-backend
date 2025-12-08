const router = require("express").Router();
const {
    login, create,
    get, checkToken, update, deleteRecord,
    restore,
    changePass,
    sendCheckinOTP,
    getStats
} = require("../controllers/admin.controller");
const middleware = require("../middleware/middleware");



router
    .route("/login")
    .post(login);

router
    .route("/create-users")
    .post(middleware, create);

router
    .route("/update-users")
    .post(middleware, update);
    
router
    .route("/change-password")
    .post(middleware, changePass);


router
    .route("/get-users")
    .post(middleware, get);

router
    .route("/delete")
    .post(middleware, deleteRecord);

router
    .route("/restore")
    .post(middleware, restore);


router
    .route("/check-token")
    .post(checkToken);

router
    .route("/send-checkin-otp")
    .post(sendCheckinOTP);

router
    .route("/statictics")
    .post(middleware, getStats);


    
module.exports = router;
