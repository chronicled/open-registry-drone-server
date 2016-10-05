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
    .post(Utils.validateFields('registrantAddress', 'access'), (req, res) => {
      const {registrantAddress, access} = req.body;
      const registrantExists = Registrants.hasRegistrant(registrantAddress);
      if (registrantExists) {
        Registrants.setAccess(registrantAddress, access);
        res.send(Registrants.getAll());
      } else {
        res.status(400).send({reason: "Registrant does not exist"});
      }
    });

  app.route('/requestChallenge')
    .post(Utils.validateFields('identity'), parseIdentity, (req, res) => {
      const { identity } = req.body;

      return sdk.getThing(identity)
      .then(thing => Promise.props({hasAccess: Registrants.checkAccess(thing.owner), thing}))
      .then( ({hasAccess, thing}) => {
        const protocolInThing = (protocol) => thing.identities.some(urn => urn.includes(protocol));
        const supportedProtocol = _.values(Utils.protocols).find(protocolInThing);
        const challenge = Utils.generateChallenge(supportedProtocol);
        const fiveMinutes = 5*60*1000; //ms
        if (!hasAccess) {
          res.status(403).send({reason: "Registrant does not have access rights"});
        } else if (!supportedProtocol) {
          res.status(400).send({reason: "Thing's public key protocol is not supported"});
        } else {
          recentChallenges[challenge] = true;
          setTimeout(() => delete recentChallenges[challenge], fiveMinutes);
          res.send({challenge});
        }
      })
      .catch(Utils.makeErrorCatcher(req, res));
    });

  app.route('/verifyChallenge')
    .post(Utils.validateFields('identity', 'challenge', 'signature'), parseIdentity, (req, res) => {
      const { identity, challenge, signature } = req.body;
      const isRecentChallenge = recentChallenges[challenge];
      const isSupportedPublicKey = urn => _.values(Utils.protocols).some(protocol => urn.includes(protocol));
      
      return sdk.getThing(identity)
      .then(thing => thing.identities)
      .then(urns => urns.find(isSupportedPublicKey))
      .then(publicKey => {
        if (publicKey) {
          const verified = sdk.verifyIdentity(publicKey, challenge, Utils.signatureToAns1(signature));
          res.send({verified: verified && isRecentChallenge});
        } else {
          res.status(400).send({reason: "Thing does not have supported public key"});
        }
      })
      .catch(Utils.makeErrorCatcher(req, res));
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
