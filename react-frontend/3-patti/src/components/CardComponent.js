import { Typography } from "@mui/material";
import React from "react";

export default function CardComponent({ rank, suit }) {
  // Unicode base points for suits (Spades, Hearts, Diamonds, Clubs)
  const SUITS = {
    spade: 0x1f0a0,
    heart: 0x1f0b0,
    diamond: 0x1f0c0,
    club: 0x1f0d0,
  };

  // Ranks for cards (1 = Ace, 11 = Jack, 12 = Queen, 13 = King)
  const RANKS = {
    A: 1, // Ace
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    J: 11, // Jack
    Q: 12, // Queen
    K: 13, // King
  };
  // Function to get card unicode
  const getCardUnicode = (suit, rank) => {
    return String.fromCodePoint(SUITS[suit] + RANKS[rank]);
  };

  const suits = { diamond: "◆", club: "♣️", heart: "♡", spade: "♤" };
  return (
    <div
      style={{
        fontSize: 120,
        color: suit == "heart" || suit == "diamond" ? "red" : "black",
      }}
    >
      {getCardUnicode(suit, rank)}
    </div>
  );
}
