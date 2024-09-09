// gives opposite sign as per normal game
// returns -1 if a>b, 0 if a==b and 1 if a<b
// both a and b are of type Array of Cards

// 3 card comparison.
// no joker
// Card: {number: Number, suit: Character}
// suit: {'S', 'H', 'D', 'C'}
// cardPower: {level: heirarchy, card:[]}

const normalCompareHands = require("./normal");

function compareHands(a, b) {
  return -1 * Math.abs(normalCompareHands(a, b));
}

module.exports = compareHands;
