const path = require('path');
const { createRequire } = require('module');

const backendRequire = createRequire(path.join(__dirname, 'backend', 'package.json'));
backendRequire('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const { createServer } = require('./backend/createServer');

const port = process.env.PORT || 5000;

createServer()
  .then(({ start }) => {
    start(port);
  })
  .catch((error) => {
    console.error('Failed to start DebateHub unified server:', error);
    process.exit(1);
  });
