const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const players = new Map();

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join-game", (player) => {
    players.set(socket.id, {
      id: socket.id,
      name: player.name || "Player",
      x: 120,
      y: 120,
      money: 0,
      level: 1,
    });

    io.emit("players-update", Array.from(players.values()));
  });

  socket.on("move", ({ x, y }) => {
    const player = players.get(socket.id);
    if (!player) return;

    player.x = x;
    player.y = y;

    io.emit("players-update", Array.from(players.values()));
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    io.emit("players-update", Array.from(players.values()));
    console.log("Disconnected:", socket.id);
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

server.listen(3001, () => {
  console.log("Game server running on http://localhost:3001");
});
