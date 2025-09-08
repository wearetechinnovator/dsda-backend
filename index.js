require("dotenv").config();
const express = require("express");
const app = express();
const PORT = 8080 || process.env.PORT;
const connection = require("./db/connection");
const cors = require("cors");
const router = require("./routes/index.route");


app.use(cors()); //Allow all origin;
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));


// test only (remove in production)
app.get("/", (req, res) => {
    res.send("hello world");
})



// API
app.use("/master/api/v1", router);



// DB connection...
connection().then(con => {
    if (con) {
        app.listen(PORT, () => {
            console.log("[*] Server running on " + PORT);
        })
    } else {
        console.log("[*] Database connection failed")
    }
}).catch((er) => {
    console.log("[*] Something went wrong: ", er)
})
