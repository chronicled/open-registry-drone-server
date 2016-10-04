'use strict';
const morgan = require('morgan');
const bodyParser = require('body-parser');
const Config = require('../config.json');
const express = require('express');
const path = require('path');

module.exports = (app) => {
  //Logging middleware and JSON parsing
  app.use(morgan('dev'));
  app.use(bodyParser.json());

  //serve client content
  app.use('/settings', express.static(path.join(__dirname, '../client/www')));

  //Only allow requests which have our specific access token
  app.use((req, res, next) => {
    const token = req.headers.authorization;
    const isVerified = token && (token === `Bearer ${Config["token"]}`);
    const isOpenPath = req.path.includes('/settings');
    return isVerified || isOpenPath ? next() : res.sendStatus(401);
  });

};
