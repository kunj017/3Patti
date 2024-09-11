const game = require("../models/game");
const enums = require("../3-patti/enums");
const gameTypes = enums.gameType;

const createGame = async (req, res) => {
  try {
    // make entry in db
    console.log(`Request from Client for newGame: `, req.body);
    let dbObject = {
      entryAmount: req.body.entryAmount,
      gameType: req.body.gameType,
      bootAmount: req.body.bootAmount,
      maxBet: req.body.maxBet,
    };
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
