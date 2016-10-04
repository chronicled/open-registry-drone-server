'use strict';
const morgan = require('morgan');
const bodyParser = require('body-parser');
const Config = require('../config.json');

module.exports = (app) => {
  //Logging middleware and JSON parsing
  app.use(morgan('dev'));
  app.use(bodyParser.json());

  //Only allow requests which have our specific access token
  app.use((req, res, next) => {
    const token = req.headers.authorization;
    const isVerified = token && (token === `Bearer ${Config["token"]}`);
    return isVerified ? next() : res.sendStatus(401);
  });
};
