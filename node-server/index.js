const express = require("express");
const connectDB = require("./db/connect");
// const enums = require("../3-patti/enums");
const createGameRoute = require("./routes/createGameRoute");
const testingRoute = require("./routes/testingRoute");
const cors = require("cors");
const { gameType } = require("./3-patti/enums");
const { createGame } = require("./controller/createGame");
const { isValidRoomId, getRoomData, removePlayer, addNewPlayer } = require("./controller/room")
const { GameModel, PlayerDataModel, CardDataModel } = require("./models/game");
const { Socket } = require("socket.io");
const compareHands = require("./3-patti/variations/normal");
const { assert } = require("console");
require("dotenv").config();

const app = express();

const http = require("http").Server(app);
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT;

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// TOOD: Create a constant file for this.
const roomTimers = {};
const gameInstances = {};
const timerLimit = 30; // seconds
const timeBeforeNewGame = 10;
const numberOfCards = 52;
const SUIT_MAP = { 0: "heart", 1: "diamond", 2: "spade", 3: "club" };
const RANK_MAP = {
  1: "A",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
};
const RANK_REVERSE_MAP = {
  A: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
};

// TODO: Create a class for playerdata as well.
// TODO: Move this class to a new file.

/**
 * This holds a snapshot of a room and manages its data. 
 * 
 * Always call init() while creating a new instance.
 * 
 * Data required:
 * 1. Room Id
 */
class GameInstance {
  #NUMBER_OF_CARDS = 52;
  #WAIT_TIME_FOR_NEW_GAME_IN_SECONDS = 10;
  #currentPlayerStartSalt = 0;
  #interval = null;
  #timer = timerLimit;
  #timerBeforeNewGame = 0;
  #playerData = [];
  #gameData = null;
  #roomId = null;
  #currentPlayer = null;
  #GAME_STATE = Object.freeze({
    paused: "paused",
    active: "active",
    terminated: "terminated",
  });
  #PLAYER_STATE = Object.freeze({
    active: "active",
    fold: "fold",
  });
  #state = this.#GAME_STATE.terminated;
  #CONTROLLER_ACTION = Object.freeze({
    bet: "bet",
    show: "show",
    fold: "fold",
    removePlayer: "removePlayer",
    timerEnd: "timerEnd"
  })
  constructor(roomId) {
    this.#roomId = roomId;
  }
  async init() {
    await this.#fetchGameData();
  }
  // TODO: Convert all functions to use class members directly.
  async #setupNewGame() {
    console.log("Setting up new game!!")
    this.#removeClock();
    await this.#fetchGameData()
    if (this.#playerData.length < 2) {
      // Do not start game for 1 player.
      console.log(`Start game called for less than 2 players`);
      await this.broadcastData();
      return;
    }
    await this.#resetGameData();
    await this.#startPot();
    await this.#distributeCards();
    await this.broadcastData();
    this.#resetGameClock();
  }
  /**Adds a player into the room. 
   * 
   * Please make sure to call broadcast data when connection is complete. 
   * This is required since the current player will not recieve any update since it is not added to the room.
   * 
   * @param newPlayerData Object for the new player data.
   * @returns {Promise<Boolean>} Whether player was added successfully or not.
   */
  async addNewPlayer(newPlayerData) {
    try {
      let status = await addNewPlayer(newPlayerData, this.#roomId)
      return status
    } catch (err) {
      console.log(`Error while adding a new player: ${err}`)
      return false
    }
  }
  async removePlayer(userId) {
    try {
      console.log(`Removing player: ${userId} from roomId: ${this.#roomId}`);
      await this.#controllerAction(this.#CONTROLLER_ACTION.removePlayer, { userId: userId });
    } catch (err) {
      console.log(`Error while removing a player: ${err}`)
      return false
    }
  }
  async #fetchGameData() {
    try {
      this.#gameData = await GameModel.findOne({ _id: this.#roomId }).lean();
      this.#playerData = this.#gameData.playerData;
    } catch (err) {
      console.log(`Error during #fetchGameData: ${err}`);
    }
  }
  async #resetGameData() {
    try {
      // Set pot to 0
      await GameModel.updateOne({ _id: this.#roomId }, { $set: { potAmount: 0 } });
      // reset cards and current bet.
      await GameModel.updateMany(
        { _id: this.#roomId },
        { $set: { "playerData.$[].cards": [], "playerData.$[].currentBet": 0 } }
      );
      // Set player state to active
      await GameModel.updateMany(
        { _id: this.#roomId },
        { $set: { "playerData.$[].state": "active" } }
      );
      // Set current player
      this.#currentPlayer = this.#playerData[(++this.#currentPlayerStartSalt) % (this.#playerData.length)];
      await GameModel.updateOne(
        {
          _id: this.#roomId,
          "playerData.userId": this.#currentPlayer.userId,
        },
        { $set: { "playerData.$.state": "current" } }
      );
    } catch (err) {
      console.log(`Error during #resetGameData: ${err}`);
    }
  }
  async #startPot() {
    try {
      // Take boot amount.
      await Promise.all(
        this.#playerData.map(async (player) => {
          await GameModel.updateOne(
            { _id: this.#roomId, "playerData.userId": player.userId },
            { $inc: { "playerData.$.balance": -this.#gameData.bootAmount } }
          );
        })
      );
      // update pot
      await GameModel.updateOne(
        { _id: this.#roomId },
        {
          $inc: {
            potAmount: this.#playerData.length * this.#gameData.bootAmount,
          },
        }
      );
    } catch (err) {
      console.log(`Error during #startPot: ${err}`);
    }
  }
  #createAndShuffleArray(n) {
    // Create an array of size n
    let arr = Array.from({ length: n }, (_, i) => i + 1);

    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  }
  async #controllerAction(action, args) {
    try {
      switch (action) {
        case this.#CONTROLLER_ACTION.bet:
          await this.#bet(args.betAmount);
          await this.#updateCurrentPlayer();
          break;
        case this.#CONTROLLER_ACTION.show:
          await this.#show(args.showAmount);
          await this.#updateCurrentPlayer();
          break
        case this.#CONTROLLER_ACTION.fold:
        case this.#CONTROLLER_ACTION.timerEnd:
          await this.#fold();
          await this.#updateCurrentPlayer();
          break;
        case this.#CONTROLLER_ACTION.removePlayer:
          await removePlayer(args.userId, this.#roomId);
          if (args.userId == this.#currentPlayer?.userId) {
            await this.#updateCurrentPlayer();
          } else {
            let activePlayers = await this.#getActivePlayers();
            if (activePlayers.length == 1) {
              await this.#declareWinner();
            } else {
              await this.broadcastData()
            }
          }
          break;
        default:
          console.log(`Invalid controller action!!`)
          return;
      }
    } catch (err) {
      console.log(`Error during #controllerAction: ${err}`);
    }
  }

  async #createCardObject(value) {
    try {
      let rank = RANK_MAP[(value % 13) + 1];
      let suit = SUIT_MAP[value % 4];
      const newCard = await CardDataModel.create({ rank: rank, suit: suit });
      return newCard;
    } catch (err) {
      console.log(`Error during #createCardObject: ${err}`);
    }
  }
  async #distributeCards() {
    try {
      // Shuffle a new deck and assign cards to each player.
      const deck = this.#createAndShuffleArray(this.#NUMBER_OF_CARDS);
      console.log("new deck: ");
      console.log(deck);
      const cards = [];
      for (let i = 0; i < this.#playerData.length; i++) {
        cards.push(
          await Promise.all(
            deck.slice(3 * i, 3 * i + 3).map(async (value) => {
              const cardObject = await this.#createCardObject(value);
              return cardObject;
            })
          )
        );
      }
      console.log("New Generated cards: ");
      console.log(cards);
      await Promise.all(
        this.#playerData.map(async (playerData, i) => {
          await GameModel.updateOne(
            {
              _id: this.#roomId,
              "playerData.userId": playerData.userId,
            },
            { $set: { "playerData.$.cards": cards[i] } }
          );
        })
      );
    } catch (err) {
      console.log(`Error during #distributeCards: ${err}`);
    }
  }
  async onUserEvent(userEvent, userId) {
    try {
      if (userId != this.#currentPlayer.userId) {
        console.log("Recieved event from another player. Ignoring event");
        return;
      }
      // userEvent = {event:"bet/show/fold", value:""}
      console.log("Player Action: ");
      console.log(userEvent);
      const event = userEvent.event;
      switch (event) {
        case "bet":
          await this.#controllerAction(this.#CONTROLLER_ACTION.bet, { betAmount: userEvent.value });
          break;
        case "show":
          await this.#controllerAction(this.#CONTROLLER_ACTION.show, { showAmount: userEvent.value });
          break;
        case "fold":
          await this.#controllerAction(this.#CONTROLLER_ACTION.fold);
          break;
        default:
          console.log("Unknown user action !!");
          return;
      }
    } catch (err) {
      console.log(`Error during onUserEvent: ${err}`);
    }
  }
  async #bet(betAmount) {
    try {
      // TODO: Apply checks to verify if bet is allowed.
      //update balance
      await GameModel.updateOne(
        {
          _id: this.#roomId,
          "playerData.userId": this.#currentPlayer.userId,
        },
        { $inc: { "playerData.$.balance": -betAmount } }
      );
      // update betAmount
      await GameModel.updateOne(
        {
          _id: this.#roomId,
          "playerData.userId": this.#currentPlayer.userId,
        },
        { $set: { "playerData.$.currentBet": betAmount } }
      );
      // Update pot
      await GameModel.updateOne(
        { _id: this.#roomId },
        {
          $inc: {
            potAmount: betAmount,
          },
        }
      );
      // update state to active from current.
      await GameModel.updateOne(
        {
          _id: this.#roomId,
          "playerData.userId": this.#currentPlayer.userId,
        },
        { $set: { "playerData.$.state": "active" } }
      );
    } catch (err) {
      console.log(`Error during #bet: ${err}`);
    }
  }
  async #getActivePlayers() {
    try {
      await this.#fetchGameData();
      return this.#playerData.filter((playerData) => (playerData.state == "active" || playerData.state == "current"));
    } catch (err) {
      console.log(`Error during #getActivePlayers: ${err}`);
    }
  }
  async #findNextActivePlayer(seatNumber) {
    try {
      let activePlayers = await this.#getActivePlayers();
      for (let i = seatNumber + 1; i < 8; i++) {
        let playerMatch = activePlayers.find((playerData) => playerData.seatNumber == i)
        if (playerMatch) return playerMatch;
      }
      for (let i = 0; i < seatNumber; i++) {
        let playerMatch = activePlayers.find((playerData) => playerData.seatNumber == i)
        if (playerMatch) return playerMatch;
      }
    } catch (err) {
      console.log(`Error during #findNextActivePlayer: ${err}`);
    }
  }
  async #findPreviousActivePlayer(seatNumber) {
    try {
      let activePlayers = await this.#getActivePlayers();
      for (let i = seatNumber - 1; i >= 0; i--) {
        let playerMatch = activePlayers.find((playerData) => playerData.seatNumber == i)
        if (playerMatch) return playerMatch;
      }
      for (let i = 7; i > seatNumber; i--) {
        let playerMatch = activePlayers.find((playerData) => playerData.seatNumber == i)
        if (playerMatch) return playerMatch;
      }
    } catch (err) {
      console.log(`Error during #findPreviousActivePlayer: ${err}`);
    }
  }
  async #updateCurrentPlayer() {
    try {
      let activePlayers = await this.#getActivePlayers();
      if (activePlayers.length == 1) {
        this.#declareWinner();
        return;
      }
      this.#currentPlayer = await this.#findNextActivePlayer(this.#currentPlayer.seatNumber);
      await GameModel.updateOne(
        {
          _id: this.#roomId,
          "playerData.userId": this.#currentPlayer.userId,
        },
        { $set: { "playerData.$.state": "current" } }
      );
      this.resetTimer();
      await this.broadcastData();
    } catch (err) {
      console.log(`Error during #updateCurrentPlayer: ${err}`);
    }

  }
  async #show(showAmount) {
    try {
      // Update balance.
      await GameModel.updateOne(
        {
          _id: this.#roomId,
          "playerData.userId": this.#currentPlayer.userId,
        },
        { $inc: { "playerData.$.balance": -showAmount } }
      );
      // Update pot
      await GameModel.updateOne(
        { _id: this.#roomId },
        {
          $inc: {
            potAmount: showAmount,
          },
        }
      );
      // Check if it is show or sideShow.
      let activePlayers = await this.#getActivePlayers();
      if (activePlayers.length == 1) {
        return;
      }
      let leftPlayer = await this.#findPreviousActivePlayer(this.#currentPlayer.seatNumber);
      let cards1 = leftPlayer.cards.map((card) => ({
        suit: card.suit,
        value: RANK_REVERSE_MAP[card.rank],
      }));
      let cards2 = this.#currentPlayer.cards.map((card) => ({
        suit: card.suit,
        value: RANK_REVERSE_MAP[card.rank],
      }));
      console.log(cards1);
      console.log(cards2);
      const comparison = compareHands(cards1, cards2);
      console.log(`Comparison result for show: ${comparison}`);
      if (comparison == 0 || comparison == 1) {
        await this.#fold();
      } else {
        await this.#fold(leftPlayer.userId);
      }
    } catch (err) {
      console.log(`Error while #show: ${err}`)
    }
  }
  async #getCards(player) {
    const data = await GameModel.findOne(
      {
        _id: this.#roomId,
      },
      "playerData"
    ).lean();
    return data.playerData.filter(
      (playerData) => playerData.userId == this.#playerData[player].userId
    )[0].cards;
  }
  async #fold(playerId = this.#currentPlayer.userId) {
    try {
      // Update player state.
      console.log(`#fold folding player with id: ${playerId}`);
      await GameModel.updateOne(
        {
          _id: this.#roomId,
          "playerData.userId": playerId,
        },
        { $set: { "playerData.$.state": "fold" } }
      );
    } catch (err) {
      console.log(`Error while #fold: ${err}`)
    }
  }
  pauseGame() {
    // remove interval
    clearInterval(this.#interval);
    this.#state = this.#GAME_STATE.paused;
  }
  #removeClock() {
    console.log("#removeClock")
    if (this.#interval) {
      console.log("removing interval!!");
      clearInterval(this.#interval);
      this.#interval = null;
    }
    this.#timer = timerLimit;
  }
  // TODO: Remove this.
  async resetTimer() {
    this.#timer = timerLimit;
  }
  #resetGameClock() {
    console.log("#resetGameClock")
    this.#timer = timerLimit;
    this.#startGameClock();
  }
  #startGameClock() {
    console.log("#startGameClock")
    // set game state active.
    this.#state = this.#GAME_STATE.active;
    // set interval
    if (this.#interval) {
      clearInterval(this.#interval);
    }
    this.#interval = setInterval(async () => {
      if (this.#timer > 0) {
        this.#timer--;
        socketIO.to(this.#roomId).emit("timeUpdate", this.#timer); // Send the timer only to clients in the room
      } else {
        console.log(`Timer ended for room: ${this.#roomId}`);
        await this.#controllerAction(this.#CONTROLLER_ACTION.timerEnd);
        this.#timer = timerLimit;
      }
    }, 1000);
  }
  async startGame() {
    try {
      console.log(`#startGame, current game state: ${this.#state}`)
      switch (this.#state) {
        case this.#GAME_STATE.terminated:
          await this.#setupNewGame();
          break;
        case this.#GAME_STATE.paused:
          this.#startGameClock();
          break;
        case this.#GAME_STATE.active:
          return;
        default:
          console.log(`Invalid game state during startGame`)
      }
    } catch (err) {
      console.log(`Error while startGame: ${err}`)
    }
  }
  #startNewGame() {
    this.#removeClock();
    this.#state = this.#GAME_STATE.terminated;
    setTimeout(async () => {
      console.log("creating new game");
      await this.startGame();
    }, this.#WAIT_TIME_FOR_NEW_GAME_IN_SECONDS * 1000);
  }
  async addMoney(userId) {
    try {
      await GameModel.updateOne(
        {
          _id: this.#roomId,
          "playerData.userId": userId,
        },
        { $inc: { "playerData.$.totalAmount": this.#gameData.entryAmount, "playerData.$.balance": this.#gameData.entryAmount } }
      );
      await this.broadcastData();
    } catch (err) {
      console.log(`Error while addMoney: ${err}`)
    }
  }
  async #declareWinner() {
    try {
      await this.#fetchGameData();
      // update state
      let activePlayers = await this.#getActivePlayers();
      let winnerId = activePlayers[0].userId;
      await GameModel.updateOne(
        {
          _id: this.#roomId,
          "playerData.userId": winnerId,
        },
        { $set: { "playerData.$.state": "winner" } }
      );
      // update numberOfWins
      await GameModel.updateOne(
        {
          _id: this.#roomId,
          "playerData.userId": winnerId,
        },
        { $inc: { "playerData.$.numberOfWins": 1 } }
      );
      // Update balance
      await GameModel.updateOne(
        {
          _id: this.#roomId,
          "playerData.userId": winnerId,
        },
        { $inc: { "playerData.$.balance": this.#gameData.potAmount } }
      );
      await this.broadcastData();
      this.#startNewGame();
    } catch (err) {
      console.log(`Error while #declareWinner: ${err}`)
    }
  }

  async broadcastData() {
    await this.#fetchGameData();
    console.log("broadcasting game data: ");
    console.log(this.#gameData);
    socketIO
      .to(this.#roomId)
      .emit("updateGameData", { success: true, data: this.#gameData });
  }
}

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  const handleJoinRoom = async (newUserData) => {
    try {
      console.log("Join room called");
      const response = { success: true };
      const roomId = newUserData.roomId;
      const isValidRoom = await isValidRoomId(roomId);
      if (!isValidRoom) {
        response.success = false;
      } else {
        if (!gameInstances[roomId]) {
          const gameInstance = new GameInstance(roomId);
          await gameInstance.init();
          gameInstances[roomId] = gameInstance;
        }
        const addPlayerStatus = await gameInstances[roomId].addNewPlayer(newUserData);
        response.success = addPlayerStatus
      }
      if (response.success) {
        socket.join(roomId);
        socket.userId = newUserData.userId;
        gameInstances[roomId].broadcastData();
      }
    } catch (err) {
      console.log(`Error while joining room: ${err}`);
    }
  };

  const onStartGame = async (roomId) => {
    console.log(`StartGame called for roomId: ${roomId}`);

    await gameInstances[roomId].startGame();
  };
  const onPlayerAction = async (req) => {
    await gameInstances[req.roomId].onUserEvent(req.action, socket.userId);
  };
  const onPauseGame = async (roomId) => {
    gameInstances[roomId].pauseGame();
  };
  const onResetTimer = async (roomId) => {
    gameInstances[roomId].resetTimer();
  };
  const handleAddMoney = async (roomId, userId) => {
    gameInstances[roomId].addMoney(userId);
  }
  const handleRemovePlayer = (roomId, userId) => {
    try {
      gameInstances[roomId].removePlayer(userId);
    }
    catch (err) {
      console.log(`Error trying to remove player from ${roomId}`)
    }
  };
  const handleNewMessage = (newMessage) => {
    socket.broadcast.emit("newMessage", newMessage);
    console.log(`new message recieved: ${newMessage}`);
    console.log(newMessage);
  };
  socket.on("disconnecting", () => {
    console.log(`🔥: ${socket.id} A user disconnecting`);
    console.log(socket.rooms);
  });
  socket.on("joinRoom", handleJoinRoom);
  socket.on("startGame", onStartGame);
  socket.on("removePlayer", handleRemovePlayer);
  socket.on("newMessage", handleNewMessage);
  socket.on("pauseGame", onPauseGame);
  socket.on("playerAction", onPlayerAction);
  socket.on("resetTimer", onResetTimer);
  socket.on("addMoney", handleAddMoney);
});

// Get Game Types
app.get("/3patti/gameTypes", (req, res) => {
  try {
    console.log("GameType request hit!")
    res.status(200).json({ gameTypes: Object.values(gameType) });
  } catch (e) {
    console.log(`Error while sending GameTypes. Error: ${e}`);
  }
});

app.get("/3patti/isValidGame", async (req, res) => {
  try {
    const isValidRoom = await isValidRoomId(req.query.roomId);
    console.log(`isValidRoom: ${isValidRoom} roomId: ${req.query.roomId}`);
    res.status(200).json({ isValidRoom: isValidRoom });
  } catch (e) {
    console.log(`Error while sending GameTypes. Error: ${e}`);
  }
});

app.post("/3patti/createGame", createGame);

const start = async () => {
  try {
    await connectDB();
    console.log("Connected to Database");
    http.listen(PORT, () => {
      console.log(`Server is listening at port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
