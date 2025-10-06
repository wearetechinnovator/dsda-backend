const router = require("express").Router();
const {
    login, create,
    get, checkToken, update, deleteRecord,
    restore,
    changePass,
    sendCheckinOTP
} = require("../controllers/admin.controller");



router
    .route("/login")
    .post(login);

router
    .route("/create-users")
    .post(create);

router
    .route("/update-users")
    .post(update);
    
router
    .route("/change-password")
    .post(changePass);


router
    .route("/get-users")
    .post(get);

router
    .route("/delete")
    .post(deleteRecord);

router
    .route("/restore")
    .post(restore);


router
    .route("/check-token")
    .post(checkToken);

router
    .route("/send-checkin-otp")
    .post(sendCheckinOTP);

module.exports = router;
