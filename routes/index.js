const Provider = require('open-registry-sdk');
const _ = require('lodash');
const Promise = require('bluebird');
const Config = require('../config.json');
const Registrants = require('../models/registrants.js');
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

  app.route('/registrants')
    .get((req, res) => res.send(Registrants.getAll()))
    .post((req, res) => {
      const {registrantAddress, access} = req.body;
      return Promise.try( () => Registrants.setAccess(registrantAddress, access))
      .then(() => res.send(Registrants.getAll()))
      .catch(() => res.status(400).send({reason: "Registrant does not exist"}));
    });


  app.route('/requestChallenge')
    .post(parseIdentity, (req, res) => {
      const { identity, parsedIdentity: { protocol } } = req.body;
      return sdk.getThing(identity)
      .then(thing => Registrants.checkAccess(thing.owner))
      .then(hasAccess => {
        if (hasAccess) {
          const challenge = Utils.generateChallenge(protocol);
          const fiveMinutes = 5*60*1000; //ms
          recentChallenges[challenge] = true;
          setTimeout(() => delete recentChallenges[challenge], fiveMinutes);
          res.send({challenge});
        } else {
          res.status(403).send({reason: "Registrant does not have access rights"});
        }
      })
      .catch(err => res.status(400).send({reason: err.message}));
    });

  app.route('/verifyChallenge')
    .post(parseIdentity, (req, res) => {
      const { identity, challenge, signature } = req.body;
      const isRecentChallenge = isRecentChallenge[challenge];
      return sdk.verifyIdentity(identity, challenge, signature)
      .then(verified => res.send({verified: verified && isRecentChallenge}))
      .catch(() => res.status(500).send({reason: "Internal Server Error"}));
    });

  function parseIdentity(req, res, next) {
    const { identity } = req.body;
    const { valid, protocol, publicKey } = Utils.parseURN(identity); 
    const isRecongizedProtocol = _.values(Utils.protocols).some(p => p === protocol);
    if (!valid) {
      res.status(400).send({reason: "Invalid URN format"});
    } else if (!isRecongizedProtocol) {
      res.status(400).send({reason: "Public key protocol not supported"});
    } else {
      req.body.parsedIdentity = {valid, protocol, publicKey};
      next();
    }
  }
};
