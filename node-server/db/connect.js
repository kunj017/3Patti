const mongoose = require("mongoose");
require("dotenv").config();
const connectionString = process.env.MONGO_URI;

const connectDB = () => {
  return mongoose.connect(connectionString);
};

module.exports = connectDB;
