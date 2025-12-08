const jwt = require('jsonwebtoken');
const JWT_KEY = process.env.JWT_KEY;
const HOTEL_JWT_KEY = process.env.HOTEL_JWT_KEY


const middleware = async (req, res, next) => {
  try {
    let token;
    let hotelToken;

    if (req.method === "POST") {
      token = req.body?.token;
    } else {
      token = req.headers?.authorization?.split(" ")[1];
    }

    if (req.method === "POST" && req.body.hotelToken) {
      hotelToken = req.body?.hotelToken;
    }
    if (req.method === "GET" && req.headers["x-hotel-token"]) {
      hotelToken = req.headers["x-hotel-token"].split(" ")[1];
    }

    console.log(req.url, "----", req.method, "----", hotelToken)

    if (!token && !hotelToken) {
      console.log("No token found in request");
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    let decoded;
    if (token) {
      decoded = jwt.verify(token, JWT_KEY);
    }
    else if (hotelToken) {
      decoded = jwt.verify(hotelToken, HOTEL_JWT_KEY);
    }

    req.user = decoded;
    next();

  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }

};

module.exports = middleware;
