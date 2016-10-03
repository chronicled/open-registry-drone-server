/* eslint-disable no-console */
'use strict';
const startServer = require('./index.js');
const Config = require('./config.json');
const port = Config["port"] || 80;
startServer(port);
console.log(`server running on port ${port} in ${process.env.NODE_ENV} mode`);
