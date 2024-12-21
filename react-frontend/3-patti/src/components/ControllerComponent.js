import {
  Button,
  Card,
  IconButton,
  Slider,
  Stack,
  Divider,
} from "@mui/material";
import React, { useEffect } from "react";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";

export default function ControllerComponent({
  socket,
  roomId,
  playerBalance,
  canShow,
  isActive,
  minBet,
}) {
  const betIncrement = 5;
  const [bet, setBet] = React.useState(0);
  const [customState, setCustomState] = React.useState(false);
  function onPlayerAction(playerAction) {
    socket.emit("playerAction", { roomId: roomId, action: playerAction });
  }
  useEffect(() => {
    setBet((prevBet) => minBet);
  }, [minBet]);
  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          height: "100%",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        {/* Bet */}
        <Stack direction="row" sx={{ flexGrow: 2, alignItems: "end" }}>
          <Stack direction="column">
            <Button
              variant="contained"
              onClick={() => {
                onPlayerAction({ event: "bet", value: bet });
              }}
              disabled={!isActive}
            >{`Bet: ${bet}`}</Button>
            <Stack direction="row"></Stack>
          </Stack>
          <Slider
            value={Math.max(bet, minBet)}
            valueLabelDisplay="auto"
            min={minBet}
            max={Math.min(2 * minBet, playerBalance)}
            step={betIncrement}
            onChange={(event) => {
              setBet(event.target.value);
            }}
            sx={{ mx: 2 }}
          ></Slider>
        </Stack>
        {/* <Divider orientation="vertical" flexItem /> */}
        <Button
          variant="contained"
          onClick={() => {
            onPlayerAction({ event: "show" });
          }}
          disabled={!isActive}
        >
          {canShow ? "Show" : "Side Show"}
        </Button>
        {/* <Divider orientation="vertical" flexItem /> */}
        <Button
          variant="contained"
          onClick={() => {
            onPlayerAction({ event: "fold" });
          }}
          disabled={!isActive}
        >
          Fold
        </Button>
      </Stack>
    </>
  );
}
