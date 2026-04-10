require('dotenv').config();
const next = require('next');
const { createServer } = require('./backend/createServer');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 10000;
const nextApp = next({
  dev,
  dir: './frontend',
});
const handle = nextApp.getRequestHandler();

nextApp.prepare()
  .then(() => {
    const { start } = createServer({
      frontendHandler: (req, res) => handle(req, res),
    });

    start(port);
  })
  .catch((error) => {
    console.error('Failed to start DebateHub unified server:', error);
    process.exit(1);
  });
