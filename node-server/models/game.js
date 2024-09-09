const mongoose = require("mongoose");
const enums = require("../3-patti/enums");
const gameTypes = enums.gameType;
const GameSchema = new mongoose.Schema({
  startAmount: {
    type: Number,
    required: [true, "Please provide startAmount"],
  },
  // add a validation here for only receiving enum types for gameType
  gameType: {
    type: String,
    required: [true, "Please provide gameType"],
    enum: Object.values(gameTypes),
  },
  maxBet: {
    type: Number,
    required: [true, "Please provide maxBet"],
  },
  potLimit: {
    type: Number,
    required: [true, "Please provide potLimit"],
  },
  bootAmount: {
    type: Number,
    required: [true, "Please provide bootAmount"],
  },
});

// hey theere
module.exports = mongoose.model("3-patti-game", GameSchema);
