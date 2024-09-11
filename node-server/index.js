const express = require("express");
const connectDB = require("./db/connect");
// const enums = require("../3-patti/enums");
const createGameRoute = require("./routes/createGameRoute");
const testingRoute = require("./routes/testingRoute");
const cors = require("cors");
const { gameType } = require("./3-patti/enums");
const { createGame } = require("./controller/createGame");
const { GameModel, PlayerDataModel } = require("./models/game");
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

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on("disconnecting", () => {
    console.log(`🔥: ${socket.id} A user disconnecting`);
    console.log(socket.rooms);
    Array.from(socket.rooms).forEach(async (roomId) => {
      await removePlayer(socket.id, roomId);
    });
  });

  socket.on("newMessage", (newMessage) => {
    socket.broadcast.emit("newMessage", newMessage);
    console.log(`new message recieved: ${newMessage.message}`);
  });

  const handleJoinRoom = async (newUserData) => {
    const response = { success: true };
    const roomId = newUserData.roomId;
    const isValidRoom = await isValidRoomId(roomId);
    if (!isValidRoom) {
      response.success = false;
    } else {
      newUserData.userId = socket.id;
      const playerAdded = await addNewPlayer(newUserData, roomId);
      // if (!playerAdded) {
      //   response.success = false;
      // }
    }

    if (response.success) {
      response.data = await getRoomData(roomId);
      socket.join(roomId);
    }
    socketIO.to(roomId).emit("updateGameData", response);
  };

  socket.on("joinRoom", handleJoinRoom);

  // Testing
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room with roomId: ${roomId}`);
  });
  socket.on("setUserData", async (data) => {
    console.log(`New User Data: ${JSON.stringify(data)}`);
    socket.data.userName = data;
    allClients = await socketIO.fetchSockets();
    allClientsName = allClients
      .filter((client) => {
        return "userName" in client.data;
      })
      .map((client) => {
        console.log(`key exists ${client.data.userName}`);
        return client.data.userName;
      });
    console.log(
      `All clients userName: ${allClientsName} length: ${allClientsName.length}`
    );
    socketIO.emit("allClientsName", allClientsName);
    const socketData = allClients.map((client) => {
      return { userName: client.data.userName, id: client.id };
    });
    socketIO.emit("allClients", socketData);
  });

  // lol
  socket.on("submit", async (data) => {
    console.log(`Submit called: ${JSON.stringify(data)}`);
    socketIO.emit("submitresponse", data);
    const allClients = await socketIO.fetchSockets();
    allClients.map((client) => console.log(client.data));
    console.log(
      `All clients: ${allClients}, length: ${Object.keys(allClients).length}`
    );

    // socket.broadcast.emit("submitresponse", data);
  });
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
    console.log(`Seats Occupied for RoomId: ${roomId}: [${seatsOccupied}]`);
    let availableSeat = 8;
    for (let i = 0; i < 8; i++) {
      if (!seatsOccupied.includes(i)) {
        availableSeat = i;
        break;
      }
    }
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
    if (await isPlayerAlreadyPresent(roomId, newPlayerData.userId)) {
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
