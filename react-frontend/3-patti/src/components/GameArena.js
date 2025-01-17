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
  Badge
} from "@mui/material";
import { green, teal, lightGreen, red } from "@mui/material/colors";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
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
import { minHeight } from "@mui/system";

export default function GameArena({ socket }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const playerBoxHeight = "90%";
  const playerBoxWidth = "25%";
  const playerBoxCenterWidth = "20%";
  const navBarColor = red[500];
  const numberOfPlayers = 8;
  const [timer, setTimer] = React.useState(0);
  const [userName, setUserName] = React.useState(
    localStorage.getItem("userName")
  );
  const [openUserNameModal, setOpenUserNameModal] = React.useState(false);
  const [unreadMessages, setUnreadMessages] = React.useState(0);
  const [chatList, setChatList] = React.useState([]);
  const [showChat, setShowChat] = React.useState(false);
  const [drawerState, setDrawerState] = React.useState(false);
  const [chatDrawerState, setChatDrawerState] = React.useState(false);
  const currentPlayerData = React.useRef(null);
  const [currentPlayerSeat, setCurrentPlayerSeat] = React.useState(0);
  const [gameData, setGameData] = React.useState({
    entryAmount: 0,
    potAmount: 0,
    bootAmount: 0,
    maxBet: 0,
    gameType: "",
    state: "",
  });
  const [playerData, setPlayerData] = React.useState(() => {
    return Array.from({ length: numberOfPlayers }, (_, i) => ({
      userId: "",
      isOccupied: false,
      totalAmount: 0,
      numberOfWins: 0,
      balance: 0,
      currentBet: 0,
      userName: "",
      cards: [],
      state: "",
    }));
  });
  const minBet = Math.max(gameData.bootAmount, Math.max(...playerData.map((data) => data.currentBet)));
  const players = Array.from({ length: numberOfPlayers }, (_, i) => (
    <SeatComponent
      totalAmount={playerData[i].totalAmount}
      numberOfWins={playerData[i].numberOfWins}
      currentBet={playerData[i].currentBet}
      userName={playerData[i].userName}
      currentBalance={playerData[i].balance}
      seatNumber={i}
      isOccupied={playerData[i].isOccupied}
      state={playerData[i].state}
      onRemovePlayer={() => {
        socket.emit("removePlayer", roomId, playerData[i].userId);
      }}
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
  // Manages chat and its drawer state as well as chat badge.
  useEffect(() => {
    if (showChat || chatDrawerState) {
      setUnreadMessages((prevCount) => (0));
      console.log(`Messages set to 0.`)
    }
    const onNewMessage = (newMessage) => {
      if (!chatDrawerState && !showChat) {
        setUnreadMessages((prevCount) => (prevCount + 1));
        console.log(`New message`)
      }
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
  }, [showChat, chatDrawerState]);

  useEffect(() => {
    console.log(`Room Id: ${roomId}`);
    console.log(`userId: ${currentPlayerData.current?.userId}`);
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
          userId: uuidv4(),
        })
      );
    }
    currentPlayerData.current = JSON.parse(localStorage.getItem(roomId));
    console.log(`userId: ${currentPlayerData.current?.userId}`);
    const roomDataInStorage = JSON.parse(localStorage.getItem(roomId));
    const newPlayerData = {
      roomId: roomId,
      userName: localStorage.getItem("userName"),
      ...currentPlayerData.current
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
      setGameData((prevData) => {
        return {
          potAmount: data.data.potAmount,
          entryAmount: data.data.entryAmount,
          bootAmount: data.data.bootAmount,
          maxBet: data.data.maxBet,
          gameType: data.data.gameType,
          state: data.data.state
        };
      });
      console.log("Game data updated: ");
      console.log(gameData);
      // const playerData = data.playerData;
      const playerDataCopy = [...playerData];
      // console.log(data.playerData)
      data.data.playerData.map((playerData, i) => {
        const {
          totalAmount,
          numberOfWins,
          balance,
          currentBet,
          userName,
          cards,
          state,
          userId,
        } = playerData;
        let newPlayerData = {
          totalAmount,
          numberOfWins,
          balance,
          currentBet,
          userName,
          state,
          userId,
        };
        newPlayerData.isOccupied = true;
        if (cards) newPlayerData.cards = cards;
        else newPlayerData.cards = [];
        const seatNumber = playerData.seatNumber;
        playerDataCopy[seatNumber] = newPlayerData;
        // set currentPlayerSeat
        console.log(`Current player userId: ${currentPlayerData.current?.userId}`);
        if (playerData.userId == currentPlayerData.current?.userId) {
          setCurrentPlayerSeat((prevSeat) => seatNumber);
          let currentLocalStorageData = JSON.parse(localStorage.getItem(roomId));
          let newLocalStorageData = {
            userId: currentLocalStorageData.userId,
            numberOfWins: playerData.numberOfWins,
            totalAmount: playerData.totalAmount,
            balance: playerData.balance
          }
          localStorage.setItem(
            roomId,
            JSON.stringify(newLocalStorageData)
          );
          currentPlayerData.current = newLocalStorageData;
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

  // alert for portrait mode setup.
  // useEffect(() => {
  //   const handleOrientationChange = () => {
  //     if (window.screen.orientation.type === 'portrait-primary') {
  //       // Show a message suggesting landscape mode
  //       alert('For the best experience, please rotate your device.');
  //     }
  //   };

  //   // Listen for orientation changes
  //   window.screen.orientation.addEventListener('change', handleOrientationChange);

  //   // Clean up the event listener
  //   return () => {
  //     window.screen.orientation.removeEventListener('change', handleOrientationChange);
  //   };
  // }, []);
  function appDrawer() {
    function pauseGame() {
      socket.emit("pauseGame", roomId);
    }
    function resumeGame() {
      socket.emit("startGame", roomId);
    }
    const addMoney = () => {
      socket.emit("addMoney", roomId, currentPlayerData.current?.userId);
      console.log(`Add money called for ${currentPlayerData.current?.userId}`);
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
        <IconButton onClick={() => { addMoney() }}>
          <AccountBalanceIcon sx={{ mr: 1 }}></AccountBalanceIcon>
          Add Money
        </IconButton>
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
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxHeight: "100vh", width: "100vw" }}>
        <AppBar id="appbar" position="static" sx={{ backgroundColor: navBarColor }}>
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              aria-label="menu"
              sx={{ backgroundColor: "white", maxHeight: "10vh" }}
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
              <SportsEsportsIcon fontSize="large"></SportsEsportsIcon>
              <Typography
                variant="h5"
                sx={{ textAlign: "center", ml: 1, fontWeight: "bold" }}
              >
                3 PATTI
              </Typography>
            </Stack>

            {!showChat && (
              <Badge badgeContent={unreadMessages} color="primary">
                <IconButton
                  size="large"
                  edge="start"
                  aria-label="menu"
                  sx={{ backgroundColor: "white" }}
                  onClick={() => {
                    console.log("drawer set");
                    setChatDrawerState(true);
                  }}
                >
                  <ChatIcon />
                </IconButton>
              </Badge>
            )}
          </Toolbar>
        </AppBar>
        <div
          style={{
            flexGrow: 1,
            maxHeight: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "auto"
          }}
        >
          <Stack
            direction="row"
            sx={{
              flexGrow: 1,
              height: "100%",
              width: "100%",
              overflow: "auto",
            }}
          >
            <div style={{ flexGrow: 1 }}>
              <Stack
                direction="column"
                sx={{ justifyContent: "space-between", height: "100%", overflow: "auto" }}
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
                      sx={{ textAlign: "center", fontWeight: 'bold' }}
                    >{`POT: ${gameData.potAmount}`}</Typography>
                    {gameData.state == "paused" && <Typography
                      variant="h6"
                      sx={{ textAlign: "center" }}
                    >{`Game is paused!!`}</Typography>}
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
                    socket={socket}
                    roomId={roomId}
                    playerBalance={playerData[currentPlayerSeat].balance}
                    canShow={playerData.filter(it => it.state === 'active').length < 2}
                    isActive={playerData[currentPlayerSeat].state === "current" && gameData.state === "active"}
                    currentBet={minBet}
                    bootAmount={gameData.bootAmount}
                    maxBet={gameData.maxBet}
                    timer={timer}
                  ></ControllerComponent>
                </Stack>
              </Stack>
            </div>
            <div style={{ width: "25%", display: showChat ? "block" : "none" }}>
              <div style={{ height: "100%" }}>
                <SharedChatComponent
                  socket={socket}
                  chatList={chatList}
                  setChatList={setChatList}
                  currentUserName={userName}
                ></SharedChatComponent>
              </div>
            </div>
          </Stack>
        </div >
      </div>
      {appDrawer()}
      {chatAppDrawer()}
      {setUserNameModal()}
    </>
  );
}
