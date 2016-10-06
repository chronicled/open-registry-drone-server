/**
 * Challenges module
 * @module models/challenges
 */
const challenges = new Set();

/**
 * stores added challenge for five minutes in Set
 * @alias module:models/challenges.add
 * @param {string} challenge challenge to be added
 */
const add = challenge => {
  challenges.add(challenge);
  const fiveMinutes = 5*60*1000; //ms
  setTimeout(() => challenges.delete(challenge), fiveMinutes);
};

/**
 * checks set to see if challenge has been added to it
 * @alias module:models/challenges.check
 * @param {string} challenge challenge to be checked
 * @returns {boolean} isPresent
 */
const check = challenge => challenges.has(challenge);

module.exports = {add, check};
