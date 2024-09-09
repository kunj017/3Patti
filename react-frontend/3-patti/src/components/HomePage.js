import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { red, teal, lime, blue, grey } from "@mui/material/colors";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Grid,
  Container,
  Paper,
  Modal,
  Stack,
} from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CreateGameForm from "./CreateGameForm";
import JoinGameForm from "./JoinGameForm";
import SocketComponent from "./SocketComponent";
import DisplayInfoInModal from "./NewGameInfoModal";
import NewGameInfoModal from "./NewGameInfoModal";

export default function HomePage({ socket }) {
  const navigate = useNavigate();
  // Updating the theme
  const backgroundColor = red[400];
  const buttonColor = "red";
  const paperColor = "#FCF6F5";
  // State Values
  const [openCreateGameModal, setOpenCreateGameModal] = React.useState(false);
  const [currentGameId, setCurrentGameId] = React.useState("");
  const [openGameInfoModal, setOpenGameInfoModal] = React.useState(false);
  const [openJoinGameModal, setOpenJoinGameModal] = React.useState(false);

  // Set Background Value
  // useEffect(() => {
  //   document.body.style.backgroundColor = backgroundColor;
  // }, []);

  // New Game Info
  const gameInfoModal = () => {
    const content = `A new game has been created with gameId: ${currentGameId} `;
    return (
      <Modal
        open={openGameInfoModal}
        onClose={() => {
          setOpenGameInfoModal(false);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <>
          <NewGameInfoModal roomId={currentGameId}></NewGameInfoModal>
        </>
      </Modal>
    );
  };

  // Create Game Modal
  const createGameModal = () => {
    function onCreateGame(gameId) {
      setOpenCreateGameModal(false);
      setCurrentGameId(gameId);
      setOpenGameInfoModal(true);
    }
    return (
      <Modal
        open={openCreateGameModal}
        onClose={() => {
          setOpenCreateGameModal(false);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <>
          <CreateGameForm
            socket={socket}
            sendChangeToParent={onCreateGame}
          ></CreateGameForm>
        </>
      </Modal>
    );
  };

  // Join Game Code
  const joinGameModal = () => {
    return (
      <Modal
        open={openJoinGameModal}
        onClose={() => {
          setOpenJoinGameModal(false);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <>
          <JoinGameForm socket={socket}></JoinGameForm>
        </>
      </Modal>
    );
  };
  return (
    <div
      className="Parent-container"
      style={{
        position: "fixed",
        height: "100vh",
        width: "100vw",
        backgroundColor: backgroundColor,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          backgroundColor: paperColor,
          height: "80vh",
          width: "80vw",
          borderColor: "green",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      >
        <Stack
          direction="column"
          sx={{
            height: "100%",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          {/* 3 Patti header */}
          <Stack
            direction="row"
            sx={{
              justifyContent: "center",
              width: 1,
            }}
          >
            <Avatar sx={{ height: 80, width: 80, mr: 2, bgcolor: buttonColor }}>
              <SportsEsportsIcon fontSize="large"></SportsEsportsIcon>
            </Avatar>
            <Typography variant="h2" component="h1" sx={{ fontWeight: "bold" }}>
              3 Patti
            </Typography>
          </Stack>

          {/* Create Game Button */}
          <Grid
            container
            direction="row"
            rowSpacing={4}
            sx={{ justifyContent: "space-around" }}
          >
            <Grid item xs={10} md={5}>
              <Button
                variant="contained"
                onClick={() => {
                  setOpenCreateGameModal(true);
                }}
                style={{ backgroundColor: buttonColor }}
                fullWidth
              >
                <Typography variant="h6">Create New Game</Typography>
              </Button>
            </Grid>

            {/* Join Game Button */}
            <Grid item xs={10} md={5} sx={{ justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={() => {
                  setOpenJoinGameModal(true);
                }}
                style={{ backgroundColor: buttonColor }}
                fullWidth
              >
                <Typography variant="h6">Join Game</Typography>
              </Button>
            </Grid>
          </Grid>
        </Stack>
        {createGameModal()}
        {joinGameModal()}
        {gameInfoModal()}
      </Paper>
      {/* </Container> */}
    </div>
  );
}
