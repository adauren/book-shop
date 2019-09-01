const mongoose = require("mongoose");
const config = require("config");
const db = config.get("database");

const dbConnect = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true
    });
    console.log("database connected");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = dbConnect;
