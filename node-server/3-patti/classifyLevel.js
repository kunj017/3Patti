// returns heirarchy.type
// hand is array of cards

const { heirarchy } = require("./enums");

const getCardsWithAceHigh = (cards) => {
  return cards
    .map((card) => {
      if (card.value == 1) {
        return 14;
      } else {
        return card.value;
      }
    })
    .sort();
};

const getCardsValue = (cards) => {
  return cards
    .map((card) => {
      card.value;
    })
    .sort();
};

const getCardsSuit = (cards) => {
  return cards
    .map((card) => {
      card.suit;
    })
    .sort();
};

const isTrail = (hand) => {
  const cards = getCardsValue(hand);
  if (cards[0] == cards[1] && cards[1] == cards[2]) return 1;
  else return 0;
};

const isPureSequence = (hand) => {
  if (!isColour(hand)) return 0;

  const cards = getCardsValue(hand);

  // last two cards should be consecutive
  if (cards[2] - cards[1] != 1) return 0;
  // if first are also then it is sequence
  if (cards[1] - cards[0] == 1) return 1;
  // AKQ
  if (cards[2] == 13 && cards[0] == 1) return 1;
  // no other condition
  return 0;
};

const isSequence = (hand) => {
  const cards = getCardsValue(hand);

  // last two cards should be consecutive
  if (cards[2] - cards[1] != 1) return 0;
  // if first are also then it is sequence
  if (cards[1] - cards[0] == 1) return 1;
  // AKQ
  if (cards[2] == 13 && cards[0] == 1) return 1;
  // no other condition
  return 0;
};

const isColour = (hand) => {
  const cardSuits = getCardsSuit(hand);
  if (cardSuits[0] != cardSuits[1] || cardSuits[1] != cardSuits[2]) return 0;
  else return 1;
};

const isPair = (hand) => {
  const cards = getCardsValue(hand);
  if (cards[0] == cards[1] || cards[1] == cards[2]) return 1;
  else return 0;
};

const classifyLevel = (hand) => {
  if (isTrail(hand)) return heirarchy.TRAIL;
  else if (isPureSequence(hand)) return heirarchy.PURE_SEQUENCE;
  else if (isSequence(hand)) return heirarchy.IMPURE_SEQUENCE;
  else if (isColour(hand)) return heirarchy.COLOUR;
  else if (isPair(hand)) return heirarchy.PAIR;
  else return heirarchy.HIGH_CARD;
};

module.exports = classifyLevel;
