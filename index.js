'use strict';
const express = require('express');
const app = express();

require(__dirname + '/middleware')(app);
require(__dirname + '/routes')(app);

const startServer = (port) => {
  app.listen(port);
};
  // export our app for testing and flexibility, required by index.js
module.exports = startServer;
