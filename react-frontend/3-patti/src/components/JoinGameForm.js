import React from "react";
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
import LinkIcon from "@mui/icons-material/Link";

export default function CreateGameForm({ socket, sendChangeToParent }) {
  const [formData, setFormData] = React.useState({
    roomId: "",
  });
  const buttonColor = red[600];
  function handleChange(event) {
    const { name, value } = event.target;
    console.log("handleChangeCalled");
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  }
  function handleSubmit() {
    console.log("submit called");
    console.log(formData);
    sendChangeToParent(formData.roomId);
  }

  return (
    <>
      <Card
        raised={true}
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          justifyContent: "center",
          minWidth: "30%",
        }}
      >
        <CardHeader
          avatar={
            <AddCircleOutlineIcon
              style={{ color: "white" }}
            ></AddCircleOutlineIcon>
          }
          title="JOIN GAME"
          titleTypographyProps={{ variant: "h6", color: "white", fontWeight: "bold" }}
          sx={{
            textAlign: "left",
            backgroundColor: buttonColor,
          }}
        ></CardHeader>

        <Stack direction="column" spacing={1.2} sx={{ mx: 1, my: 1.2 }}>
          <TextField
            required
            name="roomId"
            placeholder="Enter a valid room ID"
            value={formData.userName}
            onChange={handleChange}
            label="room ID"
            type="text"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon />
                </InputAdornment>
              ),
            }}
          ></TextField>

          <Button
            variant="contained"
            onClick={handleSubmit}
            style={{ backgroundColor: buttonColor }}
          >
            JOIN
          </Button>
        </Stack>
      </Card>
    </>
  );
}
