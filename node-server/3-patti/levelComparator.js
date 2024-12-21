// returns 1 if a>b, 0 if a==b and -1 if a<b
// both a and b are of type Array of Cards
const compareTwoNumbers = (a, b) => {
  if (a > b) return 1;
  else if (a == b) return 0;
  else return -1;
};

const compareTrail = (a, b) => {
  return compareTwoNumbers(a[0].value, b[0].value);
};

// returns sequence level from 1-12
function assignSequenceLevel(hand) {
  const cards = hand.map((card) => card.value);
  let cardLevel = cards[0] - 1;
  if (cardLevel == 0) {
    if (cards[2] == 13) cardLevel = 12;
    else cardLevel = 11;
  }
  return cardLevel;
}
// returns 1 if a>b, 0 if a==b and -1 if a<b
// both a and b are of type Array of Cards
const compareSequence = (a, b) => {
  const cardLevela = assignSequenceLevel(a);
  const cardLevelb = assignSequenceLevel(b);
  if (cardLevela > cardLevelb) return 1;
  else if (cardLevela == cardLevelb) return 0;
  else return -1;
};

const compareLexicographically = (a, b) => {
  const modifyCards = (cards) => {
    const modifiedCards = cards
      .map((card) => {
        if (card.value == 1) {
          return 14;
        } else {
          return card.value;
        }
      })
      .sort((a, b) => a - b);
    return modifiedCards;
  };

  const cardsa = modifyCards(a);
  const cardsb = modifyCards(b);

  if (cardsa[2] != cardsb[2]) return compareTwoNumbers(cardsa[2], cardsb[2]);
  else if (cardsa[1] != cardsb[1])
    return compareTwoNumbers(cardsa[1], cardsb[1]);
  else if (cardsa[0] != cardsb[0])
    return compareTwoNumbers(cardsa[0], cardsb[0]);
  else return 0;
};

const compareColour = (a, b) => {
  return compareLexicographically(a, b);
};

function comparePair(a, b) {
  const modifyCards = (cards) => {
    const modifiedCards = a
      .map((card) => {
        if (card.value == 1) {
          return 14;
        } else {
          return card.value;
        }
      })
      .sort((a, b) => a - b);
    return modifiedCards;
  };

  const cardsa = modifyCards(a);
  const cardsb = modifyCards(b);

  let paira = cardsa[0];
  if (cardsa[0] != cardsa[1]) paira = cardsa[2];
  let pairb = cardsb[0];
  if (cardsb[0] != cardsb[1]) pairb = cardsb[2];

  if (paira != pairb) return compareTwoNumbers(paira, pairb);
  else return compareLexicographically(a, b);
}

const compareHighCard = (a, b) => {
  return compareLexicographically(a, b);
};

module.exports = {
  compareTrail,
  compareSequence,
  compareColour,
  comparePair,
  compareHighCard,
  compareTwoNumbers,
};
