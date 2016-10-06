/**
 * @api {post} /requestChallenge 
 * @apiName requestChallenge
 * @apiGroup Request Challenge
 * @apiDescription Request a challenge based on a Thing's identity
 *
 * @apiParam {String} identity The identifying URN for the thing that will be challenged
 *
 * @apiSuccess {String} challenge The challenge based on the requested Thing's public key
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "challenge" : "8b2c583afdcea8f41e59a330181a72a8058490bc1c9cbf3455d632de3db0b1b1"
 *     }
 *
 * @apiError InvalidProtocol The Thing's public key uses a protocol that is not supported for challenging
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *       "reason": "Thing\'s public key protocol is not supported"
 *     }
 */
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
      .then(thing => {
        const hasAccess = Registrants.checkAccess(thing.owner);
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
