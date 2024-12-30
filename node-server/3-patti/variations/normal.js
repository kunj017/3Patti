// returns 1 if a>b, 0 if a==b and -1 if a<b
// both a and b are of type Array of Cards

// 3 card comparison.
// no joker
// Card: {number: Number, suit: Character}
// suit: {'S', 'H', 'D', 'C'}
// cardPower: {level: heirarchy, card:[]}

const { heirarchy } = require("../enums");
const classifyLevel = require("../classifyLevel");
const {
  compareTrail,
  compareSequence,
  compareColour,
  comparePair,
  compareHighCard,
  compareTwoNumbers,
} = require("../levelComparator");

const compareHands = (a, b) => {
  const levela = classifyLevel(a);
  const levelb = classifyLevel(b);
  // console.log(`LevelA: ${levela} and LevelB: ${levelb}`);

  if (levela != levelb) return compareTwoNumbers(levela, levelb);
  if (levela == heirarchy.TRAIL) return compareTrail(a, b);
  else if (
    levela == heirarchy.PURE_SEQUENCE ||
    levela == heirarchy.IMPURE_SEQUENCE
  )
    return compareSequence(a, b);
  else if (levela == heirarchy.COLOUR) return compareColour(a, b);
  else if (levela == heirarchy.PAIR) return comparePair(a, b);
  else return compareHighCard(a, b);
};

module.exports = compareHands;
