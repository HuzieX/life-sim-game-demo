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

function makePlayer(name, socketId) {
  return {
    id: socketId,
    name,
    x: 120,
    y: 120,
    money: 2500,
    level: 1,
    experience: 0,
    hunger: 100,
    energy: 100,
    hygiene: 100,
    fun: 100,
    social: 100,
    bladder: 100,
    job: "Unemployed",
    location: "City Center",
  };
}

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("create-player", ({ name } = {}) => {
    const cleanName = String(name || "Player").trim().slice(0, 18) || "Player";
    const existing = [...players.values()].find(
      (p) => p.name.toLowerCase() === cleanName.toLowerCase()
    );

    const player = existing && existing.id !== socket.id
      ? { ...existing, id: socket.id }
      : makePlayer(cleanName, socket.id);

    players.set(socket.id, player);
    socket.emit("player-state", player);
    io.emit("players-update", Array.from(players.values()));
  });

  socket.on("move", ({ x, y }) => {
    const player = players.get(socket.id);
    if (!player) return;

    player.x = x;
    player.y = y;

    io.emit("players-update", Array.from(players.values()));
  });

  socket.on("update-stats", (stats = {}) => {
    const player = players.get(socket.id);
    if (!player) return;

    const next = {
      ...player,
      ...stats,
    };

    players.set(socket.id, next);
    socket.emit("player-state", next);
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

