/**
 * @api {post} /registrants 
 * @apiName Post Registrants
 * @apiGroup Registrants
 * @apiDescription Modify access permissions for registrant
 *
 * @apiParam {Boolean} access             access boolean for registrant
 * @apiParam {String} registrantAddress   registrantAddress
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "modified" : 1
 *     }
 *
 * @apiError InvalidRegistrant The address of the given registrant doesn't exist
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "reason": "Registrant does not exist"
 *     }
 */

/**
 * @api {get} /registrants 
 * @apiName GetRegistrants
 * @apiGroup Registrants
 * @apiDescription Request All Registrants Info (address, name, access)
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "0xdc3a9db694bcdd55ebae4a89b22ac6d12b3f0c24": {
 *          name: "Chronicled Community",
 *          access: true
 *        },
 *        "0x0000000000000000000000000000000000000001": {
 *          name: "Amazon",
 *          access: false
 *        },
 *        "0x0000000000000000000000000000000000000002": {
 *          name: "Dominos",
 *          access: false
 *        }
 *     }
 *
 */

const Registrants = require('../models/registrants.js');
const { validateFields } = require('../utils');

const requestSchema = {
 'access': {
    notEmpty: true,
    isBoolean: {errorMessage: 'Access must be a Boolean'}
  },
  'registrantAddress': { //
    notEmpty: true,
    isAscii: {errorMessage: 'Challenge must be Ascii String'}
  }
};

module.exports = (app) => {
  app.route('/registrants')
    .get((req, res) => res.send(Registrants.getAll()))
    .post(validateFields(requestSchema), (req, res) => {
      const {registrantAddress, access} = req.body;
      const registrantExists = Registrants.hasRegistrant(registrantAddress);
      if (registrantExists) {
        //Set Registrant's access (Boolean) and then send back a 200 response
        Registrants.setAccess(registrantAddress, access);
        res.send({modified: 1});
      } else {
        //Send back a 400 message if the client tried to change access to a
        //Registrant that does not exist in memory
        res.status(400).send({reason: 'Registrant does not exist'});
      }
    });
};
