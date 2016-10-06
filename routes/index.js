const express = require('express');
const path = require('path');

module.exports = (app, sdk) => {
  //serve client content
  app.use('/settings', express.static(path.join(__dirname, '../client/www')));

  require('./registrants.js')(app);
  require('./requestChallenge.js')(app, sdk);
  require('./verifyChallenge.js')(app, sdk);
};
