const challenges = new Set();

const add = challenge => {
  challenges.add(challenge);
  const fiveMinutes = 5*60*1000; //ms
  setTimeout(() => challenges.delete(challenge), fiveMinutes);
};

const check = challenge => challenges.has(challenge);

module.exports = {add, check};
