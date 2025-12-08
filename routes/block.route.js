const { update, get, deleteRecord, create, restore } = require("../controllers/block.controller");
const router = require("express").Router();
const middleware = require("../middleware/middleware");


router
    .route("/create")
    .post(middleware, create);

router
    .route("/update")
    .post(middleware, update);

router
    .route("/get")
    .post(middleware, get);

router
    .route("/delete")
    .post(middleware, deleteRecord);

router
    .route("/restore")
    .post(middleware,restore);


module.exports = router;
