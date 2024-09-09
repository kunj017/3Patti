import logo from "./logo.svg";
import "./App.css";
import react from "react";
import { useEffect } from "react";
import HomePage from "./components/HomePage";
import { Routes, Route } from "react-router-dom";
import NoMatch from "./components/NoMatch";
import SocketComponent from "./components/SocketComponent";
import socketIO from "socket.io-client";
import ArrangeCircle from "./components/ArrangeCircle";
import EntryPage from "./components/EntryPage";
import UiExperiment from "./components/UiExperiment";
import GameArena from "./components/GameArena";
import ChatComponent from "./components/ChatComponent";
import SeatComponent from "./components/SeatComponent";
const socket = socketIO.connect("http://localhost:4000");

function App() {
  return (
    <Routes>
      <Route path="/" element={<EntryPage></EntryPage>}></Route>
      <Route
        path="/3patti"
        element={<HomePage socket={socket}> </HomePage>}
      ></Route>
      <Route path="circle" element={<ArrangeCircle></ArrangeCircle>}></Route>
      <Route
        path="socket"
        element={<SocketComponent socket={socket}></SocketComponent>}
      ></Route>
      <Route
        path="uiExperiment"
        element={<UiExperiment></UiExperiment>}
      ></Route>
      <Route
        path="gameArena"
        element={<GameArena socket={socket}></GameArena>}
      ></Route>
      <Route
        path="chat"
        element={<ChatComponent socket={socket}></ChatComponent>}
      ></Route>
      <Route
        path="seat"
        element={
          <SeatComponent
            numberOfReJoins={1}
            numberOfWins={2}
            currentBet={40}
            userName={"kunj"}
            currentBalance={500}
          ></SeatComponent>
        }
      ></Route>
      <Route path="*" element={<NoMatch></NoMatch>}></Route>
    </Routes>
  );
}

export default App;
