const { customAlphabet } = require("nanoid");
const mongoose = require("mongoose");
const enums = require("../3-patti/enums");
const gameTypes = enums.gameType;
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 6);
const PlayerDataSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "UserId is required"],
  },
  seatNumber: {
    type: Number,
    minimum: 0,
    maximum: 7,
    required: [true, "Seat number is required"],
  },
  userName: {
    type: String,
    required: [true, "Please provide a user name"],
  },
  numberOfWins: {
    type: Number,
    default: 0,
  },
  numberOfReJoins: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    required: [true, "Please provide a balance amount for user"],
  },
  currentBet: {
    type: Number,
    default: 0,
  },
});
const PlayerDataModel = mongoose.model("playerData", PlayerDataSchema);
const GameSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => nanoid(), // Generate a short 6-character ID
  },
  entryAmount: {
    type: Number,
    required: [true, "Please provide startAmount"],
  },
  maxBet: {
    type: Number,
    required: [true, "Please provide maxBet"],
  },
  bootAmount: {
    type: Number,
    required: [true, "Please provide bootAmount"],
  },
  // add a validation here for only receiving enum types for gameType
  gameType: {
    type: String,
    required: [true, "Please provide gameType"],
    enum: Object.values(gameTypes),
  },
  playerData: {
    type: [PlayerDataSchema],
    // default: [
    //   {
    //     userId: "testing",
    //     seatNumber: Math.floor(Math.random() * 8),
    //     userName: "Kunj",
    //     balance: 100,
    //   },
    // ],
  },
});

// hey theere
const GameModel = mongoose.model("3-patti-game", GameSchema);
module.exports = { GameModel, PlayerDataModel };
