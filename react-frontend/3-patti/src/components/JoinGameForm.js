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

export default function CreateGameForm({ socket }) {
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
    axios
      .get("http://localhost:4000/createGame")
      .then((res) => {
        console.log(`response from API ${JSON.stringify(res.data)}`);
        if (res.data.success == "false") {
          alert("Room id does not exist");
        } else {
          console.log(
            `tring to add ${socket.id} inside roomId: ${formData.roomId}`
          );
          socket.emit("join-room", formData.roomId);
        }
      })
      .catch((err) => {
        console.log(`error during handleSubmit. ErrorCode: ${err}`);
      });
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
          title="Join a new game"
          disableTypography={false}
          titleTypographyProps={{ variant: "h6", color: "white" }}
          sx={{
            textAlign: "left",
            backgroundColor: buttonColor,
          }}
        ></CardHeader>

        <Stack direction="column" spacing={1.2} sx={{ mx: 1, my: 1.2 }}>
          <TextField
            required
            name="roomId"
            value={formData.userName}
            onChange={handleChange}
            label="roomId"
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
            Click Me
          </Button>
        </Stack>
      </Card>
    </>
  );
}
