require('dotenv').config();
const { createServer } = require('./createServer');

async function startServer() {
  const { serverApp, io, start } = await createServer();
  start(process.env.PORT || 5000);
}

startServer().catch((error) => {
  console.error('Failed to start backend server:', error);
  process.exit(1);
});
