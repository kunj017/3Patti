import {
  Button,
  Card,
  IconButton,
  Slider,
  Stack,
  Divider,
} from "@mui/material";
import React, { useEffect } from "react";
import TimerOffOutlinedIcon from "@mui/icons-material/TimerOffOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";

/**
 * Controller component for user actions like bet, show/side show and fold.
 * 1. Bet slider has to start with current bet.
 * 2. Bet slider can not exceed player's balance, max bet value, and twice of current bet.
 * 3. Side show will happen at current bet value.
 * 4. Show/side show to show based on number of players.
 * @param socket Socket object. 
 * @param roomId Room Id. 
 * @param playerBalance Current player's balance. 
 * @param canShow Is show allowed. 
 * @param isActive Is current player active. 
 * @param currentBet Current Bet for room. 
 * @param bootAmount Minimum bet for room. 
 * @param maxBet Max bet for room. 
 * @param timer Clock Timer.
 * @returns Controller component to control user actions.
 */
export default function ControllerComponent({
  socket,
  roomId,
  playerBalance,
  canShow,
  isActive,
  currentBet,
  bootAmount,
  maxBet,
  timer,
}) {
  const [bet, setBet] = React.useState(0);
  function onPlayerAction(event) {
    if (event === "bet") {
      socket.emit("playerAction", { roomId: roomId, action: { event: event, value: bet } });
    } else if (event === "show") {
      socket.emit("playerAction", { roomId: roomId, action: { event: event, value: currentBet } });
    } else {
      socket.emit("playerAction", { roomId: roomId, action: { event: event } });
    }
  }
  useEffect(() => {
    console.log(`playerBalance: ${playerBalance}, canShow: ${canShow}, currentBet: ${currentBet}, bootAmount: ${bootAmount}, maxBet: ${maxBet}`)
    setBet((prevBet) => Math.max(bootAmount, currentBet));
  }, [currentBet]);
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
                onPlayerAction("bet");
              }}
              disabled={!isActive || playerBalance < currentBet}
            >{`Bet: ${bet}`}</Button>
          </Stack>
          <Slider
            value={bet}
            valueLabelDisplay="auto"
            min={Math.max(currentBet, bootAmount)}
            max={Math.min(2 * currentBet, playerBalance, maxBet)}
            step={bootAmount}
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
            onPlayerAction("show");
          }}
          disabled={!isActive || playerBalance < currentBet}
        >
          {canShow ? "Show" : "Side Show"}{` : ${currentBet}`}
        </Button>
        {/* <Divider orientation="vertical" flexItem /> */}
        <Button
          variant="contained"
          onClick={() => {
            onPlayerAction("fold");
          }}
          disabled={!isActive}
        >
          Fold
        </Button>
        <Stack direction="row" sx={{ alignItems: "center", marginLeft: 2 }}>
          {timer > 0 ? (
            <TimerOutlinedIcon
              variant="contained"
              fontSize="large"
              sx={{
                color: timer > 10 ? "black" : "red",
              }}
            ></TimerOutlinedIcon>
          ) : (
            <TimerOffOutlinedIcon fontSize="large"></TimerOffOutlinedIcon>
          )}
          <div>{timer}</div>
        </Stack>
      </Stack>
    </>
  );
}
