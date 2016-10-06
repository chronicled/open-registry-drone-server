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
        Registrants.setAccess(registrantAddress, access);
        res.send(Registrants.getAll());
      } else {
        res.status(400).send({reason: 'Registrant does not exist'});
      }
    });
};
