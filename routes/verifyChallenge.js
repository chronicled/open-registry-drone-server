const _ = require('lodash');
const Challenges = require('../models/challenges.js');
const Utils = require('../utils');

const requestSchema = {
 'identity': {
    notEmpty: true,
    isAscii: {errorMessage: 'Identity must be Ascii String'},
    isChronicledUrn: {errorMessage: 'Identity is not in urn format'}
  },
  'challenge': {
    notEmpty: true,
    isHexadecimal: {errorMessage: 'Challenge must be Hex String'}
  },
  'signature': { //
    notEmpty: true,
    isHexadecimal: {errorMessage: 'Challenge must be Hex String'}
  }
};

module.exports = (app, sdk) => {
  app.route('/verifyChallenge')
    .post(Utils.validateFields(requestSchema), (req, res) => {
      const { identity, challenge, signature } = req.body;
      const isRecentChallenge = Challenges.check(challenge);
      const serverProtocols = _.values(Utils.protocols);
      const isSupportedPublicKey = urn => serverProtocols.some(p => urn.includes(p));
      
      return sdk.getThing(identity)
      .then(thing => thing.identities)
      .then(urns => urns.find(isSupportedPublicKey))
      .then(publicKey => {
        if (publicKey) {
          const verified = sdk.verifyIdentity(publicKey, challenge, Utils.signatureToAns1(signature));
          res.send({verified: verified && isRecentChallenge});
        } else {
          res.status(400).send({reason: 'Thing does not have supported public key'});
        }
      })
      .catch(Utils.makeErrorCatcher(req, res));
    });
};
