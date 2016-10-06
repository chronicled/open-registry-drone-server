const Promise = require('bluebird');
const _ = require('lodash');
const Registrants = require('../models/registrants.js');
const Challenges = require('../models/challenges.js');
const Utils = require('../utils');

const requestSchema = {
 'identity': {
    notEmpty: true,
    isAscii: {errorMessage: 'Identity must be Ascii String'},
    isChronicledUrn: {errorMessage: 'Identity is not in urn format'}
  }
};

module.exports = (app, sdk) => {
  app.route('/requestChallenge')
    .post(Utils.validateFields(requestSchema), (req, res) => {
      const { identity } = req.body;

      return sdk.getThing(identity)
      .then(thing => Promise.props({hasAccess: Registrants.checkAccess(thing.owner), thing}))
      .then( ({hasAccess, thing}) => {
        const serverProtocols = _.values(Utils.protocols);
        const isProtocolInThing = (protocol) => thing.identities.some(urn => urn.includes(protocol));
        const supportedProtocol = serverProtocols.find(isProtocolInThing);
        const challenge = Utils.generateChallenge(supportedProtocol);
        if (!hasAccess) {
          res.status(403).send({reason: 'Registrant does not have access rights'});
        } else if (!supportedProtocol) {
          res.status(400).send({reason: 'Thing\'s public key protocol is not supported'});
        } else {
          Challenges.add(challenge);
          res.send({challenge});
        }
      })
      .catch(Utils.makeErrorCatcher(req, res));
    });
};
