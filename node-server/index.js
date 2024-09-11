const express = require("express");
const connectDB = require("./db/connect");
// const enums = require("../3-patti/enums");
const createGameRoute = require("./routes/createGameRoute");
const testingRoute = require("./routes/testingRoute");
const cors = require("cors");
const { gameType } = require("./3-patti/enums");
const { createGame } = require("./controller/createGame");
const game = require("./models/game");
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
  socket.on("disconnect", () => {
    console.log(`🔥: ${socket.id} A user disconnected`);
  });

  socket.on("newMessage", (newMessage) => {
    socket.broadcast.emit("newMessage", newMessage);
    console.log(`new message recieved: ${newMessage.message}`);
  });

  socket.on("createNewGame", (gameData) => {
    // add logic to create a new room id and add the current socket to the new room and make it leader ?
    socket.broadcast.emit("newMessage", newMessage);
    console.log(`new message recieved: ${newMessage.message}`);
  });

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
async function fetchDataById(id) {
  try {
    // Check if a document with the given ID exists
    const data = await game.findById(id);
    if (data) {
      console.log("Data found:", data);
      return data; // Return the data if found
    } else {
      console.log("No data found with the given ID");
      return null; // Return null if no data is found
    }
  } catch (error) {
    console.error("Error fetching data by ID:", error);
    throw error;
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
    const data = await fetchDataById(req.query.roomId);
    const isValidRoom = data != null;
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
