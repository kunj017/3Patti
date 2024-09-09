import React from "react";
import { Card, Box, Stack, Typography } from "@mui/material";
import LoopIcon from "@mui/icons-material/Loop";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

export default function SeatComponent({
  numberOfWins,
  numberOfReJoins,
  currentBet,
  userName,
  currentBalance,
}) {
  return (
    <>
      {/* <Box
        sx={{
          height: 100,
          width: 200,
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      > */}
      <Card
        sx={{
          height: "100%",
          width: "100%",
          padding: 0.3,
          border: 1,
        }}
      >
        <Stack
          direction="column"
          sx={{
            height: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" sx={{ width: "100%" }}>
            <EmojiEventsIcon></EmojiEventsIcon>
            <sup>{numberOfWins}</sup>
            <LoopIcon></LoopIcon>
            <sup>{numberOfReJoins}</sup>
            <div style={{ flexGrow: 1 }}></div>
            <Typography
              variant="body2"
              sx={{
                width: "fit-content",
                borderRadius: 1,
                border: 1,
                paddingX: 1,
                alignContent: "center",
              }}
            >
              {`Bet: ${currentBet}`}
            </Typography>
          </Stack>
          <Typography
            variant="h6"
            sx={{
              width: "fit-content",
              borderRadius: 1,
              border: 1,
              paddingX: 1,
              textTransform: "capitalize",
            }}
          >
            {userName}
          </Typography>
          <Stack direction="row">
            <Typography
              variant="body2"
              sx={{
                width: "fit-content",
                borderRadius: 1,
                paddingX: 1,
                fontStyle: "italic",
              }}
            >
              {`Balance: ${currentBalance}`}
            </Typography>
          </Stack>
        </Stack>
      </Card>
      {/* </Box> */}
    </>
  );
}
