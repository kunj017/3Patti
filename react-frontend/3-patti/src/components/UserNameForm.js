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

export default function UserNameForm({ sendChangeToParent }) {
  const [userName, setUserName] = React.useState("");
  const buttonColor = red[600];
  function handleSubmit() {
    console.log("submit called");
    console.log(userName);
    sendChangeToParent(userName);
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
          title="Set your user name"
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
            name="userName"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
            }}
            label="userName"
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
            Submit
          </Button>
        </Stack>
      </Card>
    </>
  );
}
