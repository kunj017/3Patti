import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { green, teal, lightGreen } from "@mui/material/colors";
import Grid from "@mui/material/Unstable_Grid2";
import MenuIcon from "@mui/icons-material/Menu";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SeatComponent from "./SeatComponent";
import ChatIcon from "@mui/icons-material/Chat";
import SharedChatComponent from "./SharedChatComponent";
import { useNavigate, useParams } from "react-router-dom";
import UserNameForm from "./UserNameForm";
import axios from "axios";

export default function GameArena({ socket }) {
  const navigate = useNavigate();
  const numberOfPlayers = 8;
  const [openUserNameModal, setOpenUserNameModal] = React.useState(false);
  const { roomId } = useParams();
  const [chatList, setChatList] = React.useState([]);
  const [showChat, setShowChat] = React.useState(false);
  const backgroundColor = lightGreen[800];
  const navBarColor = green[900];
  const [drawerState, setDrawerState] = React.useState(false);
  const [chatDrawerState, setChatDrawerState] = React.useState(false);
  const [gameData, setGameData] = React.useState({
    entryAmount: 0,
    bootAmount: 0,
    maxBet: 0,
    gameType: "",
    startAmount: 0,
  });
  const [playerData, setPlayerData] = React.useState(() => {
    return Array.from({ length: numberOfPlayers }, (_, i) => ({
      isOccupied: false,
      numberOfReJoins: 0,
      numberOfWins: 0,
      balance: 0,
      currentBet: 0,
      userName: "",
    }));
  });
  const players = Array.from({ length: numberOfPlayers }, (_, i) => (
    <SeatComponent
      numberOfReJoins={playerData[i].numberOfReJoins}
      numberOfWins={playerData[i].numberOfWins}
      currentBet={playerData[i].currentBet}
      userName={playerData[i].userName}
      currentBalance={playerData[i].balance}
    ></SeatComponent>
  ));

  // Set UserName
  const setUserNameModal = () => {
    function handleChange(userName) {
      localStorage.setItem("userName", userName);
      setOpenUserNameModal(false);
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
          return;
        }
        console.log(`Room ${roomId} exists!`);
      })
      .catch((err) => {
        console.log(
          `error during fetching valid gameStatus. ErrorCode: ${err}`
        );
      });
    console.log(playerData);
    const userName = localStorage.getItem("userName");
    // Set UserName
    if (userName) {
      console.log(`UserName: ${userName}`);
    } else {
      setOpenUserNameModal(true);
    }
    if (!localStorage.getItem("numberOfRejoins"))
      localStorage.setItem("numberOfRejoins", 0);
    if (!localStorage.getItem("numberOfVitories"))
      localStorage.setItem("numberOfVitories", 0);

    console.log(`socketId: ${socket.id}`);

    // Window size updates
    const mediaQuery = window.matchMedia("(min-width: 1200px)");
    console.log(`media query: ${mediaQuery.matches}`);
    setShowChat(mediaQuery.matches);

    const handleMediaChange = (e) => setShowChat(e.matches);

    // Using modern event listener
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  function appDrawer() {
    const drawerList = (
      <Box sx={{ width: 250 }} onClick={() => setDrawerState(false)}>
        <Typography>Hey</Typography>
      </Box>
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
              sx={{ justifyContent: "space-around", height: "100%" }}
            >
              <Stack
                direction="row"
                sx={{ justifyContent: "space-around", paddingX: 12, mt: 2 }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: "25%",
                  }}
                >
                  {players[0]}
                </Box>
                <Box
                  sx={{
                    height: "100%",
                    width: "25%",
                  }}
                >
                  {players[1]}
                </Box>
                <Box
                  sx={{
                    height: "100%",
                    width: "25%",
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
                    height: "100%",
                    width: "20%",
                  }}
                >
                  {players[3]}
                </Box>
                <Box
                  sx={{
                    height: "100%",
                    width: "20%",
                  }}
                >
                  {players[4]}
                </Box>
              </Stack>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-around", paddingX: 12 }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: "25%",
                  }}
                >
                  {players[5]}
                </Box>
                <Box
                  sx={{
                    height: "100%",
                    width: "25%",
                  }}
                >
                  {players[6]}
                </Box>
                <Box
                  sx={{
                    height: "100%",
                    width: "25%",
                  }}
                >
                  {players[7]}
                </Box>
              </Stack>
            </Stack>
          </div>
          <div style={{ width: "25%", display: showChat ? "block" : "none" }}>
            <SharedChatComponent
              socket={socket}
              chatList={chatList}
              setChatList={setChatList}
            ></SharedChatComponent>
          </div>
        </Stack>
      </Stack>
      {appDrawer()}
      {chatAppDrawer()}
      {setUserNameModal()}
    </>
  );
}

{
  /* <Box
              sx={{
                height: 100,
                width: 200,
                position: "absolute",
                left: "2%",
                top: "50%",
                transform: "translate(0%, -50%)",
              }}
            >
              <SeatComponent
                numberOfReJoins={1}
                numberOfWins={2}
                currentBet={40}
                userName={"kunj"}
                currentBalance={500}
              ></SeatComponent>
            </Box>
            <Box
              sx={{
                height: 100,
                width: 200,
                position: "absolute",
                left: "20%",
                top: "15%",
              }}
            >
              <SeatComponent
                numberOfReJoins={1}
                numberOfWins={2}
                currentBet={40}
                userName={"kunj"}
                currentBalance={500}
              ></SeatComponent>
            </Box>
            <Box
              sx={{
                height: 100,
                width: 200,
                position: "absolute",
                left: "40%",
                top: "15%",
              }}
            >
              <SeatComponent
                numberOfReJoins={1}
                numberOfWins={2}
                currentBet={40}
                userName={"kunj"}
                currentBalance={500}
              ></SeatComponent>
            </Box>
            <Box
              sx={{
                height: 100,
                width: 200,
                position: "absolute",
                left: "60%",
                top: "15%",
              }}
            >
              <SeatComponent
                numberOfReJoins={1}
                numberOfWins={2}
                currentBet={40}
                userName={"kunj"}
                currentBalance={500}
              ></SeatComponent>
            </Box>
            <Box
              sx={{
                height: 100,
                width: 200,
                position: "absolute",
                right: "5%",
                top: "50%",
                transform: "translate(0%, -50%)",
              }}
            >
              <SeatComponent
                numberOfReJoins={1}
                numberOfWins={2}
                currentBet={40}
                userName={"kunj"}
                currentBalance={500}
              ></SeatComponent>
            </Box>
            <Box
              sx={{
                height: 100,
                width: 200,
                position: "absolute",
                left: "20%",
                bottom: "10%",
                transform: "translate(0%, 0%)",
              }}
            >
              <SeatComponent
                numberOfReJoins={1}
                numberOfWins={2}
                currentBet={40}
                userName={"kunj"}
                currentBalance={500}
              ></SeatComponent>
            </Box>
            <Box
              sx={{
                height: 100,
                width: 200,
                position: "absolute",
                left: "40%",
                bottom: "10%",
                transform: "translate(0%, 0%)",
              }}
            >
              <SeatComponent
                numberOfReJoins={1}
                numberOfWins={2}
                currentBet={40}
                userName={"kunj"}
                currentBalance={500}
              ></SeatComponent>
            </Box>
            <Box
              sx={{
                height: 100,
                width: 200,
                position: "absolute",
                left: "60%",
                bottom: "10%",
                transform: "translate(0%, 0%)",
              }}
            >
              <SeatComponent
                numberOfReJoins={1}
                numberOfWins={2}
                currentBet={40}
                userName={"kunj"}
                currentBalance={500}
              ></SeatComponent>
            </Box> */
}
