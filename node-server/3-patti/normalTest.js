const compareHands = require("./variations/normal");

const SUITS = ["diamond", "heart", "club", "spade"];
// for (let i = 0; i < 100; i++) {
//   const cards1 = Array.from({ length: 3 }, (_, i) => ({
//     value: Math.floor(13 * Math.random()) + 1,
//     // suit: SUITS[Math.floor(4 * Math.random())],
//     suit: SUITS[i],
//   }));

//   const cards2 = Array.from({ length: 3 }, (_, i) => ({
//     value: Math.floor(13 * Math.random()) + 1,
//     // suit: SUITS[Math.floor(4 * Math.random())],
//     suit: SUITS[i],
//   }));

//   console.log(cards1);
//   console.log(cards2);

//   console.log(compareHands(cards1, cards2));
// }

hand1 = [{ value: 7, suit: "diamond" }, { value: 7, suit: "diamond" }, { value: 7, suit: "heart" }];
hand2 = [{ value: 5, suit: "spade" }, { value: 13, suit: "heart" }, { value: 9, suit: "diamond" }];
console.log(compareHands(hand1, hand2));

// [
//     { value: 9, suit: 'club' },
//     { value: 10, suit: 'club' },
//     { value: 6, suit: 'heart' }
//   ]
//   [
//     { value: 8, suit: 'spade' },
//     { value: 12, suit: 'heart' },
//     { value: 7, suit: 'club' }
//   ]
//   [ 10, 6, 9 ]
//   [ 12, 7, 8 ]
//   1, 1
//   1

// [
//     { value: 4, suit: 'club' },
//     { value: 9, suit: 'heart' },
//     { value: 5, suit: 'club' }
//   ]
//   [
//     { value: 4, suit: 'spade' },
//     { value: 10, suit: 'spade' },
//     { value: 5, suit: 'club' }
//   ]
//   [ 4, 5, 9 ]
//   [ 10, 4, 5 ]
//   1, 1
//   1
