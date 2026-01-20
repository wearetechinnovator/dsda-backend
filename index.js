require("dotenv").config();
const express = require("express");
const app = express();
const PORT = 8080 || process.env.PORT;
const connection = require("./db/connection");
const cors = require("cors");
const compression = require("compression");
const router = require("./routes/index.route");
const { amenityCron, autoChekoutCron, autoPaymentCheck } = require('./helper/cronJob')



// app.use(cors({
//     origin: process.env.CORS_ORIGIN.split(","),
//     credentials: true
// }));
app.use(cors({
    origin: '*',
    credentials: true
}));
// app.use(compression({
//     level: 6,
//     threshold: 1024,
//     filter: (req, res) => {
//         if (res.getHeader('Content-Type') === 'application/json') {
//             return true;
//         }
//         return false;
//     }
// }));
app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ limit: '300mb', extended: true }));




// test only (remove in production)
app.get("/", (req, res) => {
    res.send({ msg: "Hello world" });
})



// API
app.use("/master/api/v1", router);




// DB connection...
connection().then(con => {
    if (con) {
        amenityCron(); //Amenity CRON;
        autoChekoutCron(); //Auto Checkout CRON;
        //autoPaymentCheck(); //Auto Payment Check CRON;

        app.listen(PORT, () => {
            console.log("[*] Server running on " + PORT);
        })
    } else {
        console.log("[*] Database connection failed")
    }
}).catch((er) => {
    console.log("[*] Something went wrong: ", er)
})
