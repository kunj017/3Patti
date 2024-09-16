import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  AppBar,
  Typography,
  Avatar,
  Button,
  Container,
  Paper,
  Modal,
  Stack,
  Toolbar,
  IconButton,
  Drawer,
  Divider,
  Card,
} from "@mui/material";
import { green, teal, lightGreen } from "@mui/material/colors";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import TimerOffOutlinedIcon from "@mui/icons-material/TimerOffOutlined";
import Grid from "@mui/material/Unstable_Grid2";
import MenuIcon from "@mui/icons-material/Menu";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SeatComponent from "./SeatComponent";
import ChatIcon from "@mui/icons-material/Chat";
import SharedChatComponent from "./SharedChatComponent";
import { useNavigate, useParams } from "react-router-dom";
import UserNameForm from "./UserNameForm";
import axios from "axios";
import CardComponent from "./CardComponent";
import ControllerComponent from "./ControllerComponent";

export default function GameArena({ socket }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const playerBoxHeight = "90%";
  const playerBoxWidth = "20%";
  const playerBoxCenterWidth = "20%";
  const navBarColor = green[800];
  const numberOfPlayers = 8;
  const numberOfCards = 3;
  const currentPot = 100;
  const [timer, setTimer] = React.useState(0);
  const [userName, setUserName] = React.useState(
    localStorage.getItem("userName")
  );
  const [openUserNameModal, setOpenUserNameModal] = React.useState(false);
  const [chatList, setChatList] = React.useState([]);
  const [showChat, setShowChat] = React.useState(false);
  const [drawerState, setDrawerState] = React.useState(false);
  const [chatDrawerState, setChatDrawerState] = React.useState(false);
  let currentPlayerUserId = null;
  const [currentPlayerSeat, setCurrentPlayerSeat] = React.useState(0);
  const [gameData, setGameData] = React.useState({
    entryAmount: 0,
    bootAmount: 0,
    maxBet: 0,
    gameType: "",
  });
  const [playerData, setPlayerData] = React.useState(() => {
    return Array.from({ length: numberOfPlayers }, (_, i) => ({
      isOccupied: false,
      numberOfReJoins: 0,
      numberOfWins: 0,
      balance: 0,
      currentBet: 0,
      userName: "",
      cards: [],
    }));
  });
  const players = Array.from({ length: numberOfPlayers }, (_, i) => (
    <SeatComponent
      numberOfReJoins={playerData[i].numberOfReJoins}
      numberOfWins={playerData[i].numberOfWins}
      currentBet={playerData[i].currentBet}
      userName={playerData[i].userName}
      currentBalance={playerData[i].balance}
      seatNumber={i}
      isOccupied={playerData[i].isOccupied}
      isCurrentPlayer={currentPlayerSeat == i}
    ></SeatComponent>
  ));
  const cards = playerData[currentPlayerSeat].cards.map((cardData) => (
    <CardComponent rank={cardData.rank} suit={cardData.suit}></CardComponent>
  ));

  // Set UserName
  const setUserNameModal = () => {
    function handleChange(userName) {
      localStorage.setItem("userName", userName);
      setOpenUserNameModal(false);
      setUserName(userName);
    }
    return (
      <Modal
        open={openUserNameModal}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <>
          <UserNameForm
            socket={socket}
            sendChangeToParent={handleChange}
          ></UserNameForm>
        </>
      </Modal>
    );
  };

  useEffect(() => {
    const onNewMessage = (newMessage) => {
      console.log(`newMessage recieved: ${newMessage}`);
      setChatList((prevChatList) => [
        ...prevChatList,
        {
          fromSelf: false,
          content: newMessage.content,
          userName: newMessage.userName,
        },
      ]);
    };
    socket.on("newMessage", onNewMessage);
    return () => {
      socket.off("newMessage", onNewMessage);
    };
  }, []);

  useEffect(() => {
    console.log(`Room Id: ${roomId}`);
    // Validate if room exists.

    axios
      .get(`http://localhost:4000/3patti/isValidGame`, {
        params: { roomId: roomId },
      })
      .then((res) => {
        console.log(res.data.isValidRoom);
        if (!res.data.isValidRoom) {
          navigate("/invalidRoom");
          return false;
        }
        console.log(`Room ${roomId} exists!`);
        return true;
      })
      .catch((err) => {
        console.log(
          `error during fetching valid gameStatus. ErrorCode: ${err}`
        );
        navigate("/invalidRoom");

        return false;
      });

    console.log(playerData);
    console.log(cards);

    if (userName == null) {
      setOpenUserNameModal(true);
      console.log(`UserName: ${userName}`);
      return;
    }

    console.log(`After userName`);
    if (!localStorage.getItem(roomId)) {
      console.log(`Local storage does not exist for roomId: ${roomId}`);
      localStorage.setItem(
        roomId,
        JSON.stringify({
          numberOfReJoins: 0,
          numberOfWins: 1,
          userId: uuidv4(),
        })
      );
    }
    currentPlayerUserId = JSON.parse(localStorage.getItem(roomId)).userId;

    const roomDataInStorage = JSON.parse(localStorage.getItem(roomId));
    const newPlayerData = {
      roomId: roomId,
      userName: localStorage.getItem("userName"),
      numberOfReJoins: roomDataInStorage.numberOfReJoins,
      numberOfWins: roomDataInStorage.numberOfWins,
      userId: roomDataInStorage.userId,
    };
    socket.emit("joinRoom", newPlayerData);

    // Handle data update from server.
    const handleUpdateGameData = (data) => {
      if (!data.success) {
        console.log(`Error returned from server!`);
        return;
      }
      console.log("Game data from Server:");
      console.log(data);
      setGameData((prevData) => ({
        entryAmount: data.entryAmount,
        bootAmount: data.bootAmount,
        maxBet: data.maxBet,
        gameType: data.gameType,
      }));
      // const playerData = data.playerData;
      const playerDataCopy = [...playerData];
      // console.log(data.playerData)
      data.data.playerData.map((playerData, i) => {
        const {
          numberOfReJoins,
          numberOfWins,
          balance,
          currentBet,
          userName,
          cards,
        } = playerData;
        let newPlayerData = {
          numberOfReJoins,
          numberOfWins,
          balance,
          currentBet,
          userName,
        };
        newPlayerData.isOccupied = true;
        if (cards) newPlayerData.cards = cards;
        else newPlayerData.cards = [];
        const seatNumber = playerData.seatNumber;
        playerDataCopy[seatNumber] = newPlayerData;
        // set currentPlayerSeat
        if (playerData.userId == currentPlayerUserId) {
          setCurrentPlayerSeat((prevSeat) => seatNumber);
          console.log(`CurrentPlayer Seat: ${seatNumber}`);
        }
      });
      setPlayerData((prevData) => playerDataCopy);
      console.log(playerDataCopy);
    };
    socket.on("updateGameData", handleUpdateGameData);

    // Window size updates
    const mediaQuery = window.matchMedia("(min-width: 1200px)");
    console.log(`media query: ${mediaQuery.matches}`);
    setShowChat(mediaQuery.matches);

    const handleMediaChange = (e) => setShowChat(e.matches);

    // Using modern event listener
    mediaQuery.addEventListener("change", handleMediaChange);

    const onTimerUpdate = (time) => {
      console.log(`Got TimeUpdate`);
      setTimer(time);
    };
    socket.on("timeUpdate", onTimerUpdate);

    return () => {
      socket.off("updateGameData", handleUpdateGameData);
      socket.off("timeUpdate", onTimerUpdate);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [userName]);

  const onResetTimer = () => {
    socket.emit("resetTimer", roomId);
  };

  function appDrawer() {
    function pauseGame() {
      socket.emit("pauseGame", roomId);
    }
    function resumeGame() {
      socket.emit("startGame", roomId);
    }
    const drawerList = (
      <Stack
        direction="column"
        sx={{ width: 250 }}
        onClick={() => setDrawerState(false)}
      >
        <IconButton
          onClick={() => {
            resumeGame();
          }}
        >
          <PlayCircleIcon sx={{ mr: 1 }}></PlayCircleIcon>
          Start/Resume
        </IconButton>
        <IconButton
          onClick={() => {
            pauseGame();
          }}
        >
          <PauseCircleIcon sx={{ mr: 1 }}></PauseCircleIcon>
          Pause
        </IconButton>
        <IconButton onClick={() => {}}>
          <AccountBalanceIcon sx={{ mr: 1 }}></AccountBalanceIcon>
          Add Money
        </IconButton>

        <Button
          variant="contained"
          onClick={() => {
            onResetTimer();
          }}
        >
          Reset Timer
        </Button>
      </Stack>
    );
    return (
      <>
        <Drawer open={drawerState} onClose={() => setDrawerState(false)}>
          {drawerList}
        </Drawer>
      </>
    );
  }

  function chatAppDrawer() {
    const drawerList = (
      <Box sx={{ width: 400, height: "100%" }}>
        <SharedChatComponent
          socket={socket}
          chatList={chatList}
          setChatList={setChatList}
          currentUserName={userName}
        ></SharedChatComponent>
      </Box>
    );
    return (
      <>
        <Drawer
          open={chatDrawerState}
          anchor="right"
          onClose={() => setChatDrawerState(false)}
        >
          {drawerList}
        </Drawer>
      </>
    );
  }
  return (
    <>
      <Stack
        direction="column"
        sx={{
          height: "100vh",
          width: "100vw",
          position: "fixed",
          left: 0,
          top: 0,
        }}
      >
        <AppBar position="static" sx={{ backgroundColor: navBarColor }}>
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              aria-label="menu"
              sx={{ mr: 2, backgroundColor: "white" }}
              onClick={() => {
                console.log("drawer set");
                setDrawerState(true);
              }}
            >
              <MenuIcon />
            </IconButton>
            <Stack
              direction="row"
              sx={{
                justifyContent: "center",
                flexGrow: 1,
                alignItems: "center",
              }}
            >
              <Avatar sx={{ mr: 1 }}>
                <SportsEsportsIcon></SportsEsportsIcon>
              </Avatar>
              <Typography
                variant="h6"
                component="div"
                sx={{ textAlign: "center" }}
              >
                3 Patti
              </Typography>
            </Stack>

            {!showChat && (
              <IconButton
                size="large"
                edge="start"
                aria-label="menu"
                sx={{ mr: 2, backgroundColor: "white" }}
                onClick={() => {
                  console.log("drawer set");
                  setChatDrawerState(true);
                }}
              >
                <ChatIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>

        <Stack
          direction="row"
          sx={{
            height: "100%",
            width: "100%",
            // position: "relative",
          }}
        >
          <div style={{ flexGrow: 1, position: "relative" }}>
            <Stack
              direction="column"
              sx={{ justifyContent: "space-between", height: "100%" }}
            >
              <Stack
                direction="row"
                sx={{ justifyContent: "space-around", paddingX: 12, mt: 2 }}
              >
                <Box
                  sx={{
                    height: playerBoxHeight,
                    width: playerBoxWidth,
                  }}
                >
                  {players[0]}
                </Box>
                <Box
                  sx={{
                    height: playerBoxHeight,
                    width: playerBoxWidth,
                  }}
                >
                  {players[1]}
                </Box>
                <Box
                  sx={{
                    height: playerBoxHeight,
                    width: playerBoxWidth,
                  }}
                >
                  {players[2]}
                </Box>
              </Stack>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  paddingX: 1,
                }}
              >
                <Box
                  sx={{
                    height: playerBoxHeight,
                    width: playerBoxCenterWidth,
                  }}
                >
                  {players[7]}
                </Box>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: playerBoxHeight,
                    width: playerBoxCenterWidth,
                    border: 1,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ textAlign: "center" }}
                  >{`POT: ${currentPot}`}</Typography>
                </Card>
                <Box
                  sx={{
                    height: playerBoxHeight,
                    width: playerBoxCenterWidth,
                  }}
                >
                  {players[3]}
                </Box>
              </Stack>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-around", paddingX: 12 }}
              >
                <Box
                  sx={{
                    height: playerBoxHeight,
                    width: playerBoxWidth,
                  }}
                >
                  {players[6]}
                </Box>
                <Box
                  sx={{
                    height: playerBoxHeight,
                    width: playerBoxWidth,
                  }}
                >
                  {players[5]}
                </Box>
                <Box
                  sx={{
                    height: playerBoxHeight,
                    width: playerBoxWidth,
                  }}
                >
                  {players[4]}
                </Box>
              </Stack>
              {/* Controller */}
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  justifyContent: "space-between",
                  paddingX: 2,
                  alignItems: "center",
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "center",
                    paddingX: 2,
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">Cards: </Typography>
                  {cards.map((card) => card)}
                </Stack>
                <ControllerComponent
                  canShow={false}
                  playerBalance={200}
                  currentGameBet={30}
                ></ControllerComponent>

                <Stack direction="row" sx={{ alignItems: "center" }}>
                  {timer > 0 ? (
                    <TimerOutlinedIcon
                      variant="contained"
                      fontSize="large"
                      sx={{
                        color: timer > 10 ? "black" : "red",
                      }}
                    ></TimerOutlinedIcon>
                  ) : (
                    <TimerOffOutlinedIcon fontSize="large"></TimerOffOutlinedIcon>
                  )}
                  <div>{timer}</div>
                </Stack>
              </Stack>
            </Stack>
          </div>
          <div style={{ width: "25%", display: showChat ? "block" : "none" }}>
            <Stack direction="column" sx={{ height: "100%" }}>
              <SharedChatComponent
                socket={socket}
                chatList={chatList}
                setChatList={setChatList}
                currentUserName={userName}
              ></SharedChatComponent>
            </Stack>
          </div>
        </Stack>
      </Stack>
      {appDrawer()}
      {chatAppDrawer()}
      {setUserNameModal()}
    </>
  );
}
