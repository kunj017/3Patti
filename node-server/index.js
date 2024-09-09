const express = require("express");
const connectDB = require("./db/connect");
const createGameRoute = require("./routes/createGameRoute");
const testingRoute = require("./routes/testingRoute");
const cors = require("cors");
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

app.use("/creategame", createGameRoute);
app.use("/testing", testingRoute);

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
