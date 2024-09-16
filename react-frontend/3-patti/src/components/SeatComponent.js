import React from "react";
import { Card, Box, Stack, Typography } from "@mui/material";
import LoopIcon from "@mui/icons-material/Loop";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

export default function SeatComponent({
  numberOfWins,
  numberOfReJoins,
  currentBet,
  userName,
  currentBalance,
  seatNumber,
  isOccupied,
  isCurrentPlayer,
}) {
  return (
    <>
      <Card
        sx={{
          height: "100%",
          width: "100%",
          padding: 0.3,
          border: isCurrentPlayer ? 3 : 1,
          borderColor: isCurrentPlayer ? "red" : "black",
          backgroundColor: isOccupied ? "white" : "grey",
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
            <CurrencyRupeeIcon></CurrencyRupeeIcon>
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
          <Stack direction="row" sx={{ width: "100%" }}>
            {seatNumber}
            <Typography
              variant="body2"
              sx={{
                width: "fit-content",
                borderRadius: 1,
                paddingX: 1,
                fontStyle: "italic",
                marginX: "auto",
              }}
            >
              {`Balance: ${currentBalance}`}
            </Typography>
          </Stack>
        </Stack>
      </Card>
    </>
  );
}
