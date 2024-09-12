import {
  Button,
  Card,
  IconButton,
  Slider,
  Stack,
  Divider,
} from "@mui/material";
import React from "react";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";

export default function ControllerComponent({
  currentGameBet,
  playerBalance,
  canShow,
  onShow,
  onFold,
  onBet,
}) {
  const betIncrement = 5;
  const [bet, setBet] = React.useState(0);
  const [customState, setCustomState] = React.useState(false);
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
            <Button variant="contained">{`Bet: ${bet}`}</Button>
            <Stack direction="row"></Stack>
          </Stack>
          <Slider
            value={bet}
            valueLabelDisplay="auto"
            min={currentGameBet}
            max={Math.min(2 * currentGameBet, playerBalance)}
            step={betIncrement}
            onChange={(event) => {
              setBet(event.target.value);
            }}
            sx={{ mx: 2 }}
          ></Slider>
        </Stack>
        {/* <Divider orientation="vertical" flexItem /> */}
        <Button variant="contained">{canShow ? "Side Show" : "Show"}</Button>
        {/* <Divider orientation="vertical" flexItem /> */}
        <Button variant="contained">Fold</Button>
      </Stack>
    </>
  );
}
