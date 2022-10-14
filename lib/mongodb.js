const config = require("../config/key");
const mongoose = require("mongoose");

mongoose.connect(
    config.mongoURI,
).then(() => console.log("MongoDB Connected...")).catch(err => console.error("에러 :", err));

module.exports = mongoose;
