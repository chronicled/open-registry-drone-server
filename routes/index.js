const Provider = require('open-registry-sdk');
const Promise = require('bluebird');
const express = require('express');
const _ = require('lodash');
const path = require('path');
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

  //serve client content
  app.use('/settings', express.static(path.join(__dirname, '../client/www')));

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
      const { identity } = req.body;
      return sdk.getThing(identity)
      .then(thing => Promise.props({hasAccess: Registrants.checkAccess(thing.owner), thing}))
      .then( ({hasAccess, thing}) => {
        const thingSupportsProtocol = (protocol) => thing.identities.some(urn => urn.includes(protocol));
        const supportedProtocol = _.values(Utils.protocols).find(p => thingSupportsProtocol(p));
        if (!hasAccess) {
          res.status(403).send({reason: "Registrant does not have access rights"});
        } else if (!supportedProtocol) {
          res.status(400).send({reason: "Thing's public key protocol is not supported"});
        } else {
          const challenge = Utils.generateChallenge(supportedProtocol);
          const fiveMinutes = 5*60*1000; //ms
          recentChallenges[challenge] = true;
          setTimeout(() => delete recentChallenges[challenge], fiveMinutes);
          res.send({challenge});
        }
      })
      .catch(err => res.status(400).send({reason: err.message || 'Thing could not be found'}));
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
    const { valid, protocol, value } = Utils.parseURN(identity); 
    if (!valid) {
      res.status(400).send({reason: "Invalid URN format"});
    } else {
      req.body.parsedIdentity = {valid, protocol, value};
      next();
    }
  }
};
