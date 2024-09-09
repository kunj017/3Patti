import React from "react";
import axios from "axios";
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

export default function NewGameInfoModal({ modalTitle, roomId }) {
  const cardHeader = (title, InputTaskIcon) => {
    return (
      <CardHeader
        avatar={InputTaskIcon}
        title={title}
        disableTypography={false}
        titleTypographyProps={{ variant: "h4", color: "white" }}
        sx={{
          textAlign: "left",
          backgroundColor: "#1976d2",
        }}
      ></CardHeader>
    );
  };

  return (
    <>
      <Card
        raised={true}
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          justifyContent: "center",
        }}
      >
        {cardHeader(
          modalTitle,
          <AddCircleOutlineIcon
            style={{ color: "white" }}
          ></AddCircleOutlineIcon>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            ml: 1,
            mr: 1,
            my: 1,
            // backgroundColor: "aqua",
          }}
        >
          <Typography variant="h4">RoomId: {roomId}</Typography>
          <Button> Click Here to join the game</Button>
        </Box>
      </Card>
    </>
  );
}
