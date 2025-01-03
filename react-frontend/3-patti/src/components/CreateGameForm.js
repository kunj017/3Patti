import React, { useEffect, useState } from "react";
import axios from "axios";
import { red, teal, lime, blue, grey } from "@mui/material/colors";
import {
  Box,
  Button,
  TextField,
  Typography,
  CardHeader,
  Card,
  Stack,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

export default function CreateGameForm({ socket, sendChangeToParent }) {
  // Theme
  const buttonColor = red[600];
  const [gameTypes, setGameTypes] = useState(["Hello"]);
  const [formData, setFormData] = useState({
    userName: "",
    entryAmount: 0,
    bootAmount: 0,
    maxBet: 0,
    gameType: "",
  });
  // Create new game
  const handleChange = (event) => {
    const { name, value } = event.target;
    console.log(
      `Form Data Changed for field: ${name} to: ${value}, ${parseInt(value)}`
    );
    var parsedValue = value;
    if (name == "entryAmount" || name == "bootAmount" || name == "maxBet") {
      parsedValue = isNaN(parseInt(value)) ? 0 : parseInt(value);
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: parsedValue,
    }));
  };
  const handleSubmit = () => {
    console.log("submit called");
    console.log(formData);
    if (formData.userName.length == 0) {
      alert("User Name can not be empty!!!");
      return;
    }
    if (formData.gameType == "") {
      alert("Please select a game type!!!");
      return;
    }
    const postData = {
      entryAmount: formData.entryAmount,
      bootAmount: formData.bootAmount,
      maxBet: formData.maxBet,
      gameType: formData.gameType,
      startAmount: formData.entryAmount,
    };
    axios
      .post("http://localhost:4000/3patti/creategame", postData)
      .then((res) => {
        const room_id = res.data.body._id;
        console.log(
          `Response from server: ${JSON.stringify(
            res.data
          )} with room_id: ${room_id}`
        );
        if (res.data.success === "false") {
          alert("Please provide valid input!!!");
        } else {
          sendChangeToParent(room_id);
          localStorage.setItem("userName", formData.userName);
        }
      })
      .catch((err) => {
        console.log(`Error during createGame. ErrorCode: ${err}`);
        alert("Please provide valid input!!!");
      });
  };
  useEffect(() => {
    console.log(`UseEffect called for CreateFameForm.`);
    axios
      .get("http://localhost:4000/3patti/gameTypes")
      .then((res) => {
        try {
          setGameTypes(res.data.gameTypes);
        }
        catch (err) {
          console.log(`error during getGameTypes. ErrorCode: ${err}, Response: ${res}`);
        }
      })
      .catch((err) => {
        console.log(`error during getGameTypes. ErrorCode: ${err}`);
      });
  }, []);
  return (
    <>
      <Card
        raised={true}
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          justifyContent: "center",
          minWidth: "35%"
        }}
      >
        <CardHeader
          avatar={
            <AddCircleOutlineIcon
              style={{ color: "white" }}
            ></AddCircleOutlineIcon>
          }
          title="CREATE NEW GAME"
          disableTypography={false}
          titleTypographyProps={{ variant: "h6", color: "white", fontWeight: "bold" }}
          sx={{
            textAlign: "left",
            backgroundColor: buttonColor,
          }}
        ></CardHeader>

        <Stack
          direction="column"
          spacing={1.2}
          sx={{ justifyContent: "space-around", mx: 1, my: 1.2 }}
        >
          <TextField
            required
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            label="User Name"
            type="text"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleIcon />
                </InputAdornment>
              ),
            }}
          ></TextField>
          <TextField
            error={isNaN(parseInt(formData.entryAmount))}
            required
            name="entryAmount"
            value={formData.entryAmount}
            onChange={handleChange}
            label="Entry Amount"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyRupeeIcon />
                </InputAdornment>
              ),
            }}
          ></TextField>
          <TextField
            error={isNaN(parseInt(formData.bootAmount))}
            required
            name="bootAmount"
            value={formData.bootAmount}
            onChange={handleChange}
            label="Boot Amount"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyRupeeIcon />
                </InputAdornment>
              ),
            }}
          ></TextField>

          <TextField
            error={isNaN(parseInt(formData.maxBet))}
            required
            name="maxBet"
            value={formData.maxBet}
            onChange={handleChange}
            label="Max Bet"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyRupeeIcon />
                </InputAdornment>
              ),
            }}
          ></TextField>

          <TextField
            select
            defaultValue={gameTypes[0]}
            name="gameType"
            value={formData.gameType}
            onChange={handleChange}
            label="Game Type"
            type="text"
          >
            {gameTypes.map((game, index) => {
              return (
                <MenuItem key={index} value={game} sx={{ textTransform: "uppercase" }}>
                  {game}
                </MenuItem>
              );
            })}
          </TextField>

          <Button
            variant="contained"
            onClick={handleSubmit}
            style={{ backgroundColor: buttonColor }}
          >
            CREATE
          </Button>
        </Stack>
      </Card>
    </>
  );
}
