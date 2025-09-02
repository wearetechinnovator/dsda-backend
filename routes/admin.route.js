const router = require("express").Router();
const { login, create, get, checkToken } = require("../controllers/admin.controller");


router
    .route("/login")
    .post(login);

router
    .route("/create-users")
    .post(create);

router
    .route("/get-users")
    .post(get);

router
    .route("/check-token")
    .post(checkToken);



module.exports = router;