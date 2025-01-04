const express = require("express");
const connectDB = require("./db/connect");
// const enums = require("../3-patti/enums");
const createGameRoute = require("./routes/createGameRoute");
const testingRoute = require("./routes/testingRoute");
const cors = require("cors");
const { gameType } = require("./3-patti/enums");
const { createGame } = require("./controller/createGame");
const { GameModel, PlayerDataModel, CardDataModel } = require("./models/game");
const { Socket } = require("socket.io");
const compareHands = require("./3-patti/variations/normal");
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
 * This holds a snapshot of a room and manages its data. Always call setupNewGame() to create a new instance.
 * 
 * Data required:
 * 1. Room Id
 */
class GameInstance {
  #interval = null;
  #timer = timerLimit;
  #timerBeforeNewGame = 0;
  #playerData = [];
  #gameData = null;
  #roomId = null;
  currentPlayer = 0;
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
  constructor(roomId) {
    this.#roomId = roomId;
  }
  // TODO: Convert all functions to use class members directly.
  async setupNewGame() {
    await this.fetchGameData(this.#roomId);
    await this.resetGameData(this.#roomId);
    await this.startPot(this.#roomId);
    await this.distributeCards(this.#roomId, this.#playerData);
    await this.broadcastData();
  }
  async fetchGameData(roomId) {
    this.#gameData = await GameModel.findOne({ _id: roomId }).lean();
    this.#playerData = this.#gameData.playerData;
  }
  async resetGameData(roomId) {
    // TODO update together all queries which have same selector.
    // Set pot to 0
    await GameModel.updateOne({ _id: roomId }, { $set: { potAmount: 0 } });
    await GameModel.updateMany(
      { _id: roomId },
      { $set: { "playerData.$[].cards": [], "playerData.$[].currentBet": 0 } }
    );
    // Set player state to idle
    await GameModel.updateMany(
      { _id: roomId },
      { $set: { "playerData.$[].state": "idle" } }
    );
    // Set in game players to active.
    await GameModel.updateOne(
      { _id: roomId },
      { $set: { "playerData.$[elem].state": "active" } },
      {
        arrayFilters: [
          {
            "elem.userId": {
              $in: this.#playerData.map((playerData) => playerData.userId),
            },
          },
        ],
      }
    );
    // Set current player
    await GameModel.updateOne(
      {
        _id: this.#roomId,
        "playerData.userId": this.#playerData[this.currentPlayer].userId,
      },
      { $set: { "playerData.$.state": "current" } }
    );
  }
  async startPot(roomId) {
    // Take boot amount.
    await Promise.all(
      this.#playerData.map(async (player) => {
        await GameModel.updateOne(
          { _id: roomId, "playerData.userId": player.userId },
          { $inc: { "playerData.$.balance": -this.#gameData.bootAmount } }
        );
      })
    );
    // update pot
    await GameModel.updateOne(
      { _id: roomId },
      {
        $inc: {
          potAmount: this.#playerData.length * this.#gameData.bootAmount,
        },
      }
    );
  }
  createAndShuffleArray(n) {
    // Create an array of size n
    let arr = Array.from({ length: n }, (_, i) => i + 1);

    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  }

  async createCardObject(value) {
    let rank = RANK_MAP[(value % 13) + 1];
    let suit = SUIT_MAP[value % 4];
    const newCard = await CardDataModel.create({ rank: rank, suit: suit });
    return newCard;
  }
  async distributeCards(roomId, players) {
    // Shuffle a new deck and assign cards to each player.
    const deck = this.createAndShuffleArray(numberOfCards);
    console.log("new deck: ");
    console.log(deck);
    const cards = [];
    for (let i = 0; i < players.length; i++) {
      cards.push(
        await Promise.all(
          deck.slice(3 * i, 3 * i + 3).map(async (value) => {
            const cardObject = await this.createCardObject(value);
            return cardObject;
          })
        )
      );
    }
    console.log("New Generated cards: ");
    console.log(cards);
    await Promise.all(
      players.map(async (playerData, i) => {
        await GameModel.updateOne(
          {
            _id: roomId,
            "playerData.userId": playerData.userId,
          },
          { $set: { "playerData.$.cards": cards[i] } }
        );
      })
    );
  }
  async onUserEvent(userEvent, userId) {
    if (userId != this.#playerData[this.currentPlayer].userId) {
      console.log("Recieved event from another player. Ignoring event");
      return;
    }
    // userEvent = {event:"bet/show/fold", value:""}
    console.log("Player Action: ");
    console.log(userEvent);
    const event = userEvent.event;
    switch (event) {
      case "bet":
        await this.bet(userEvent.value);
        break;
      case "show":
        await this.show(userEvent.value);
        break;
      case "fold":
        await this.fold();
        break;
      default:
        console.log("Unknown user action !!");
    }
  }
  async bet(betAmount) {
    // TODO: Apply checks to verify if bet is allowed.
    //update balance
    await GameModel.updateOne(
      {
        _id: this.#roomId,
        "playerData.userId": this.#playerData[this.currentPlayer].userId,
      },
      { $inc: { "playerData.$.balance": -betAmount } }
    );
    // update betAmount
    await GameModel.updateOne(
      {
        _id: this.#roomId,
        "playerData.userId": this.#playerData[this.currentPlayer].userId,
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
    await this.updateCurrentPlayer("normal");
  }
  async show(showAmount) {
    // Update balance.
    await GameModel.updateOne(
      {
        _id: this.#roomId,
        "playerData.userId": this.#playerData[this.currentPlayer].userId,
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
    // Check comparison, declare winner.
    const leftPlayer =
      (this.currentPlayer - 1 + this.#playerData.length) %
      this.#playerData.length;
    let cards1 = await this.getCards(leftPlayer);
    let cards2 = await this.getCards(this.currentPlayer);
    cards1 = cards1.map((card) => ({
      suit: card.suit,
      value: RANK_REVERSE_MAP[card.rank],
    }));
    cards2 = cards2.map((card) => ({
      suit: card.suit,
      value: RANK_REVERSE_MAP[card.rank],
    }));
    console.log(cards1);
    console.log(cards2);
    const comparison = compareHands(cards1, cards2);
    if (comparison == 0 || comparison == 1) {
      await this.fold();
    } else {
      await GameModel.updateOne(
        {
          _id: this.#roomId,
          "playerData.userId": this.#playerData[leftPlayer].userId,
        },
        { $set: { "playerData.$.state": "fold" } }
      );
      await this.updateCurrentPlayer("previousFold");
    }
    console.log(comparison);
  }
  async getCards(player) {
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
  async fold() {
    // Update player state.
    await GameModel.updateOne(
      {
        _id: this.#roomId,
        "playerData.userId": this.#playerData[this.currentPlayer].userId,
      },
      { $set: { "playerData.$.state": "fold" } }
    );

    await this.updateCurrentPlayer("currentFold");
  }
  pauseGame() {
    // remove interval
    clearInterval(this.#interval);
    this.#state = this.#GAME_STATE.paused;
  }
  async resetTimer() {
    this.#timer = timerLimit;
    await this.broadcastData();
  }
  async startGame() {
    if (this.#state === this.#GAME_STATE.terminated) {
      console.log("Have to setUp new Game");
      this.#timer = timerLimit;
      await this.setupNewGame();
    }
    // set interval
    this.#state = this.#GAME_STATE.active;
    if (this.#interval) {
      clearInterval(this.#interval);
    }
    this.#interval = setInterval(async () => {
      if (this.#timer > 0) {
        this.#timer--;
        socketIO.to(this.#roomId).emit("timeUpdate", this.#timer); // Send the timer only to clients in the room
      } else {
        console.log(`Timer ended for room: ${this.#roomId}`);
        this.fold();
        this.#timer = timerLimit;
      }
    }, 1000);
    await this.broadcastData();
  }
  async startNewGame() {
    this.pauseGame();
    this.#state = this.#GAME_STATE.terminated;
    setTimeout(async () => {
      console.log("creating new game");
      await this.startGame();
    }, timeBeforeNewGame * 1000);
  }
  async updateCurrentPlayer(event) {
    if (event == "normal") {
      this.currentPlayer = (this.currentPlayer + 1) % this.#playerData.length;
    } else if (event == "currentFold") {
      this.#playerData.splice(this.currentPlayer, 1);
      this.currentPlayer = this.currentPlayer % this.#playerData.length;
    } else if (event == "previousFold") {
      this.#playerData.splice(
        (this.currentPlayer - 1 + this.#playerData.length) %
        this.#playerData.length,
        1
      );
      this.currentPlayer = this.currentPlayer % this.#playerData.length;
    } else {
      console.log("please provide correct event");
      return;
    }
    if (this.#playerData.length == 1) {
      await this.declareWinner();
      return;
    }
    await this.setCurrentPlayer();
    await this.broadcastData();
    await this.resetTimer();
  }
  async setCurrentPlayer() {
    await GameModel.updateOne(
      { _id: this.#roomId },
      { $set: { "playerData.$[elem].state": "active" } },
      {
        arrayFilters: [
          {
            "elem.userId": {
              $in: this.#playerData.map((playerData) => playerData.userId),
            },
          },
        ],
      }
    );
    await GameModel.updateOne(
      {
        _id: this.#roomId,
        "playerData.userId": this.#playerData[this.currentPlayer].userId,
      },
      { $set: { "playerData.$.state": "current" } }
    );
  }
  async addMoney(userId) {
    await GameModel.updateOne(
      {
        _id: this.#roomId,
        "playerData.userId": userId,
      },
      { $inc: { "playerData.$.totalAmount": this.#gameData.entryAmount, "playerData.$.balance": this.#gameData.entryAmount } }
    );
    this.broadcastData();
  }
  async declareWinner() {
    // update state
    await GameModel.updateOne(
      {
        _id: this.#roomId,
        "playerData.userId": this.#playerData[0].userId,
      },
      { $set: { "playerData.$.state": "winner" } }
    );
    // update numberOfWins
    await GameModel.updateOne(
      {
        _id: this.#roomId,
        "playerData.userId": this.#playerData[0].userId,
      },
      { $inc: { "playerData.$.numberOfWins": 1 } }
    );
    // Update balance
    const potAmount = (await GameModel.findById(this.#roomId).lean()).potAmount;
    await GameModel.updateOne(
      {
        _id: this.#roomId,
        "playerData.userId": this.#playerData[0].userId,
      },
      { $inc: { "playerData.$.balance": potAmount } }
    );
    this.broadcastData();
    await this.startNewGame();
  }

  async broadcastData() {
    const updatedData = await GameModel.findById(this.#roomId).lean();
    updatedData.activePlayer = this.currentPlayer;
    console.log("updated game data: ");
    console.log(updatedData);
    socketIO
      .to(this.#roomId)
      .emit("updateGameData", { success: true, data: updatedData });
  }
}

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on("disconnecting", () => {
    console.log(`🔥: ${socket.id} A user disconnecting`);
    console.log(socket.rooms);
  });
  socket.on("removePlayer", (req) => {
    const { roomId, userId } = req;
    Array.from(socket.rooms)
      .filter((roomId) => roomId != socket.id)
      .forEach(async (roomId) => {
        await removePlayer(userId, roomId);
        const newGameData = await getRoomData(roomId);
        console.log(`Removing player: ${userId} from roomId: ${roomId}`);
        socketIO
          .to(roomId)
          .emit("updateGameData", { success: true, data: newGameData });
      });
  });

  socket.on("newMessage", (newMessage) => {
    socket.broadcast.emit("newMessage", newMessage);
    console.log(`new message recieved: ${newMessage}`);
    console.log(newMessage);
  });

  const handleJoinRoom = async (newUserData) => {
    console.log("Join room called");
    const response = { success: true };
    const roomId = newUserData.roomId;
    if (!gameInstances[roomId]) {
      const gameInstance = new GameInstance(roomId);
      gameInstances[roomId] = gameInstance;
    }

    const isValidRoom = await isValidRoomId(roomId);
    if (!isValidRoom) {
      response.success = false;
    } else {
      const playerAdded = await addNewPlayer(newUserData, roomId);
    }

    if (response.success) {
      response.data = await getRoomData(roomId);
      socket.join(roomId);
      socket.userId = newUserData.userId;
    }

    socketIO.to(roomId).emit("updateGameData", response);
  };

  const onStartGame = async (roomId) => {
    console.log(`StartGame called for roomId: ${roomId}`);

    gameInstances[roomId].startGame();
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
  socket.on("startGame", onStartGame);
  socket.on("pauseGame", onPauseGame);
  socket.on("playerAction", onPlayerAction);
  socket.on("resetTimer", onResetTimer);
  socket.on("joinRoom", handleJoinRoom);
  socket.on("addMoney", handleAddMoney);
});

// Function to check if data exists by ID
async function isValidRoomId(id) {
  try {
    // Check if a document with the given ID exists
    const data = await GameModel.exists({ _id: id });
    if (data) {
      return true; // Return the data if found
    } else {
      console.log("No data found with the given ID");
      return false; // Return null if no data is found
    }
  } catch (error) {
    console.error("Error fetching data by ID:", error);
    throw error;
  }
}

async function findSeatNumber(roomId) {
  try {
    const playerData = await GameModel.findOne(
      { _id: roomId },
      "playerData"
    ).lean();

    const seatsOccupied = playerData.playerData.map(
      (playerData) => playerData.seatNumber
    );
    seatsOccupied.sort();
    let availableSeat = 8;
    for (let i = 0; i < 8; i++) {
      if (!seatsOccupied.includes(i)) {
        availableSeat = i;
        break;
      }
    }
    console.log(
      `Seats Occupied for RoomId: ${roomId}: [${seatsOccupied}. Available Seat: ${availableSeat}]`
    );
    return availableSeat;
  } catch (err) {
    console.log(`Error while finding seatNumber: ${err}`);
  }
}

// TODO implement this after sessions are implemented for clients.
async function isPlayerAlreadyPresent(roomId, userId) {
  const data = await GameModel.findById(roomId).lean();
  return data.playerData
    .map((playerData) => playerData.userId)
    .includes(userId);
}
async function getRoomData(roomId) {
  const roomData = await GameModel.findOne({ _id: roomId });
  console.log(roomData);
  return roomData;
}
async function removePlayer(playerId, roomId) {
  try {
    await GameModel.updateOne(
      { _id: roomId }, // ID of the document to update
      { $pull: { playerData: { userId: playerId } } } // Use $push to add 'new-tag' to the 'tags' array
    );
  } catch (err) {
    console.log(
      `Error while removing player: ${playerId} from room: ${roomId}`
    );
  }
}
async function addNewPlayer(newPlayerData, roomId) {
  try {
    const seatNumber = await findSeatNumber(roomId);
    const isDuplicatePlayer = await isPlayerAlreadyPresent(
      roomId,
      newPlayerData.userId
    );
    if (isDuplicatePlayer) {
      console.log(`Player is already Present!`);
      return true;
    } else if (seatNumber > 7) {
      // Return something to client
      console.log(`Room is full!!`);
      return false;
    } else {
      const data = await GameModel.findOne({ _id: roomId }).lean();
      const entryAmount = data.entryAmount;
      if (entryAmount == null) {
        console.log(`Error while getting EntryAmount!`);
        return false;
      }
      newPlayerData.seatNumber = seatNumber;
      newPlayerData.balance = entryAmount;
      newPlayerData.totalAmount = entryAmount;
      const newPlayer = await PlayerDataModel.create(newPlayerData);
      await GameModel.findByIdAndUpdate(
        roomId, // ID of the document to update
        { $push: { playerData: newPlayer } }, // Use $push to add 'new-tag' to the 'tags' array
        { new: true } // Optionally return the updated document
      )
        .then((res) => {
          return true;
        })
        .catch((err) => {
          console.log(`Error while adding new player: ${err}`);
        });
    }
  } catch (err) {
    console.log(`Error while adding new Player: ${err}`);
  }
}
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
