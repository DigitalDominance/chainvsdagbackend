// src/server.js
const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");

const routes = require("./routes/index");
const subscribeBlock = require("./services/wasm_rpc");

const app = express();

// Built-in body parsing (no need for body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional health + root routes
app.get("/health", (_req, res) => res.status(200).send("OK"));
app.use("/", routes);

// Create ONE HTTP server so WS and HTTP share the same port
const server = http.createServer(app);

// Attach WebSocket server on a fixed path
const wss = new WebSocketServer({ server, path: "/ws" });

// --- WebSocket keepalive (important on Heroku/proxies) ---
function heartbeat() { this.isAlive = true; }

wss.on("connection", (ws, req) => {
  ws.isAlive = true;
  ws.on("pong", heartbeat);

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress;
  console.log("WS connected", { ip });

  // Greet the client
  ws.send(JSON.stringify({ type: "hello", msg: "Connected to Kaspa WS" }));

  ws.on("message", (data) => {
    // Handle your protocol here
    let parsed = data;
    try { parsed = JSON.parse(data); } catch {}
    console.log("WS message:", parsed);
    // Example echo:
    ws.send(JSON.stringify({ type: "echo", data: parsed }));
  });

  ws.on("close", () => {
    console.log("WS closed", { ip });
  });
});

// Terminate stale sockets; ping to keep connections alive
const pingInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => clearInterval(pingInterval));

// Heroku will set PORT
const PORT = process.env.PORT || 3005;

server.listen(PORT, () => {
  console.log(`HTTP+WS server listening on ${PORT}`);
  // Start your kaspa-wasm subscription loop, pass the WS server
  subscribeBlock(wss);
});
