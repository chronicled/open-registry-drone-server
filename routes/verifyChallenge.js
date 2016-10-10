/**
 * @api {post} /verifyChallenge 
 * @apiName verifyChallenge
 * @apiGroup Verify Challenge
 * @apiDescription verify a challenge that has been signed by a Thing's public key
 *
 * @apiParam {String} identity The identifying URN for the thing that has been challenged
 * @apiParam {String} challenge The challenge that was sent to the thing
 * @apiParam {String} signature The string that resulted when the Thing signed the challenge
 *
 * @apiSuccess {Boolean} verified The result of testing the signature against the challenge for the Thing
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "verified" : true
 *     }
 *
 * @apiError InvalidPublicKey The Thing's public key uses a protocol for signing that is not supported
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *       "reason": "Thing does not have a supported public key"
 *     }
 */
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
          //Signature is verified using the SDK and then sent back as true provided the challenge 
          //was created within the past 5 minutes
          const verified = sdk.verifyIdentity(publicKey, challenge, Utils.signatureToAns1(signature));
          res.send({verified: verified && isRecentChallenge});
        } else {
          //if lookup results in Thing with no public key for challenging, we send a 400 error message
          res.status(400).send({reason: 'Thing does not have supported public key'});
        }
      })
      .catch(Utils.makeErrorCatcher(req, res));
    });
};
