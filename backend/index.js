require('dotenv').config();
const { createServer } = require('./createServer');

const { app, io, start } = createServer();

start(process.env.PORT || 5000);

module.exports = { app, io };
