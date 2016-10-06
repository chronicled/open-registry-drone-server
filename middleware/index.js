'use strict';
const morgan = require('morgan');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const Utils = require('../utils');
const Config = require('../config.json');

module.exports = (app) => {
  //Logging middleware and JSON parsing
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(expressValidator({
    customValidators: {
      isChronicledUrn: urn => Utils.parseURN(urn).valid
    }
  }));

  //filters requests that do not have an authorization token for specific
  //access points
  app.use((req, res, next) => {
    const token = req.headers.authorization;
    const isVerified = token && (token === `Bearer ${Config["token"]}`);
    const isOpenPath = req.path.includes('/settings');
    return isVerified || isOpenPath ? next() : res.sendStatus(401);
  });

};
