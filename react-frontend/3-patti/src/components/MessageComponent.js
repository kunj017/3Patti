import React from "react";
import { Typography } from "@mui/material";
import { display } from "@mui/system";

export default function MessageComponent({ message }) {
  //   message.fromSelf = false;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: message.fromSelf ? "flex-end" : "flex-start",
        margin: 10,
      }}
    >
      <Typography
        sx={{
          width: "fit-content",
          mr: 1,
        }}
      >
        {message.fromSelf ? "you: " : message.userName}
      </Typography>

      <Typography
        sx={{
          width: "fit-content",
          //   backgroundColor: message.fromSelf ? "green" : "grey"
          borderRadius: 1,
          border: 1,
          paddingX: 1,
        }}
      >
        {message.content}
      </Typography>
    </div>
  );
}
