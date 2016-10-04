const Provider = require('open-registry-sdk');
const Config = require('../config.json');
const Utils = require('../utils');
const contracts = {
  registrarAddress: Config['registrarAddress'],
  registryAddress: Config['registryAddress']
};

const sdk = new Provider(Config['rpcUrl'], 'consumer', null, contracts);
const recentChallenges = {};

module.exports = (app) => {
  app.route('/')
    .get((req, res) => res.send(require('../package.json')));

  app.route('/requestChallenge')
    .post((req, res) => {
      const { identity } = req.body;
      const { valid, protocol } = Utils.parseURN(identity);

      if (!valid) {
        return res.status(400).send({reason: "Invalid URN format"});
      } else {
        return sdk.getThing(identity)
        .then((thing) => {
          const challenge = Utils.generateChallenge(protocol);
          const fiveMinutes = 5*60*1000; //ms
          recentChallenges[challenge] = true;
          setTimeout(() => delete recentChallenges[challenge], fiveMinutes);
          res.send({challenge: Utils.generateChallenge(protocol), thing});
        })
        .catch(() => res.status(400).send({reason: "Item could not be found"}));
      }
    });

  app.route('/verifyChallenge')
    .post((req, res) => {
      const { identity, challenge, signature } = req.body;
      const { valid } = Utils.parseURN(identity);
      const isRecentChallenge = isRecentChallenge[challenge];

      if(!valid) {
        return res.status(400).send({reason: "Invalid URN format"});
      } else {
        return sdk.verifyIdentity(identity, challenge, signature)
        .then(verified => res.send({verified: verified && isRecentChallenge}))
        .catch(() => res.status(500).send({reason: "Internal Server Error"}));
      }
    });
};
