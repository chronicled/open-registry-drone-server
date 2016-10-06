'use strict';
const Provider = require('open-registry-sdk');
const express = require('express');
const Config = require('./config.json');
const app = express();

const contracts = {
  registrarAddress: Config['registrarAddress'],
  registryAddress: Config['registryAddress']
};
const sdk = new Provider(Config['rpcUrl'], 'consumer', null, contracts);

require(__dirname + '/middleware')(app);
require(__dirname + '/routes')(app, sdk);

const startServer = (port) => {
  app.listen(port);
};
  // export our app for testing and flexibility, required by index.js
module.exports = startServer;
