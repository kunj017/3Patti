const game = require("../models/game");
const enums = require("../3-patti/enums");
const gameTypes = enums.gameType;

const getMaxBet = (startAmount) => {
  return Math.floor(startAmount / 2);
};
const getPotLimit = (startAmount) => {
  return 8 * getMaxBet(startAmount);
};
const getBootAmount = (startAmount) => {
  return Math.floor(startAmount / 20);
};
const createGame = async (req, res) => {
  try {
    // make entry in db
    const startAmount = req.body.startAmount;
    let dbObject = req.body;
    // dbObject.gameType = gameTypes.NORMAL;
    dbObject.maxBet = getMaxBet(startAmount);
    dbObject.potLimit = getPotLimit(startAmount);
    dbObject.bootAmount = getBootAmount(startAmount);

    const task = await game.create(dbObject);
    console.log(`task Body: ${task}`);
    return res.status(200).json({
      success: true,
      body: task,
      msg: "Created new game instance.",
    });
  } catch (err) {
    console.log(`Error while createTask ${err}`);
    res.json({ success: "false", error: err });
  }
};

module.exports = { createGame };
