const http = require('http');

const data = JSON.stringify({
  messages: [{ role: 'user', content: 'test request' }]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/support/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', error => {
  console.error('Request setup error:', error);
});

req.write(data);
req.end();
