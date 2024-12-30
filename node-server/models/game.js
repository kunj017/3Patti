const { customAlphabet } = require("nanoid");
const mongoose = require("mongoose");
const enums = require("../3-patti/enums");
const gameTypes = enums.gameType;
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 6);
const CardDataSchema = new mongoose.Schema({
  rank: {
    type: String,
    required: [true, "Please provide card rank"],
    enum: ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
  },
  suit: {
    type: String,
    enum: ["heart", "diamond", "spade", "club"],
    required: [true, "Please provide card rank"],
  },
});
const CardDataModel = mongoose.model("cardData", CardDataSchema);

const PlayerDataSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "UserId is required"],
    unique: true,
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
  totalAmount: {
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
  state: {
    type: String,
    enum: ["current", "active", "fold", "idle", "winner"],
    // current: currentPlayer, active: In game, fold: eliminated from current game, idle: in room,
    default: "idle",
  },
  cards: { type: [CardDataSchema] },
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
  potAmount: {
    type: Number,
    default: 0,
  },
  playerData: {
    type: [PlayerDataSchema],
  },
});

// hey theere
const GameModel = mongoose.model("3-patti-game", GameSchema);
module.exports = { GameModel, PlayerDataModel, CardDataModel };
