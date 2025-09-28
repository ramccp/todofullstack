const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const mongoURI = process.env.MONGO_URI;


async function initializeDB() {
    await mongoose.connect(mongoURI).then(() => {
        console.log("Connected to MongoDB");
    }).catch((err) => {
        console.log("Error connecting to MongoDB", err);
    });
}

module.exports = { initializeDB };