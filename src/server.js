const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const http = require('http'); // Import http module
const subscribeBlock = require('./services/wasm_rpc');
const WebSocket = require('ws');

const app = express();
// ✅ Heroku sets process.env.PORT, fallback to 3000 locally
const PORT = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mount routes (make sure ./routes/index exports a Router)
app.use('/', routes);

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');

  ws.on('message', (message) => {
    console.log('Received message from client:', message);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  subscribeBlock(wss); // Pass the WebSocket server to subscribeBlock
});
