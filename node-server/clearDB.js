const connectDB = require("./db/connect");
const game = require("./models/game");

const start = async () => {
  try {
    await connectDB();
    console.log("Connected to Database");
    await game.deleteMany({});
    console.log("Delete success!");
    return;
  } catch (error) {
    console.log(error);
  }
};

start();
