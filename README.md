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

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
    status: "Ready",
  };
}

function getUpdatedPlayer(player) {
  let level = player.level;
  if (player.experience >= level * 100) {
    level += 1;
    player.level = level;
    player.status = "Level up!";
  }

  return {
    ...player,
    hunger: clamp(player.hunger, 0, 100),
    energy: clamp(player.energy, 0, 100),
    hygiene: clamp(player.hygiene, 0, 100),
    fun: clamp(player.fun, 0, 100),
    social: clamp(player.social, 0, 100),
    bladder: clamp(player.bladder, 0, 100),
    level,
  };
}

function broadcastState(socket) {
  const state = Array.from(players.values()).map((player) => getUpdatedPlayer(player));
  io.emit("players-update", state);
  if (socket) {
    socket.emit("player-state", getUpdatedPlayer(players.get(socket.id) || state[0]));
  }
}

function emitStatus(socket, message) {
  if (socket) socket.emit("status-message", message);
}

function hasLowStats(player) {
  return player.hunger < 20 || player.energy < 20 || player.hygiene < 25 || player.bladder < 20;
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
    emitStatus(socket, `Welcome, ${player.name}!`);
    io.emit("players-update", Array.from(players.values()));
  });

  socket.on("move", ({ x, y }) => {
    const player = players.get(socket.id);
    if (!player) return;

    player.x = clamp(Number(x) || 120, 20, 920);
    player.y = clamp(Number(y) || 120, 70, 560);
    player.location = player.x < 300 ? "City Center" : player.x < 600 ? "Downtown" : "Suburbs";

    if (player.location === "City Center") player.job = player.job || "Freelancer";

    io.emit("players-update", Array.from(players.values()));
  });

  socket.on("work", () => {
    const player = players.get(socket.id);
    if (!player) return;

    if (player.energy < 20) {
      emitStatus(socket, "You are too tired to work.");
      return;
    }

    player.money += 80 + player.level * 15;
    player.experience += 25;
    player.energy = clamp(player.energy - 18, 0, 100);
    player.hunger = clamp(player.hunger - 12, 0, 100);
    player.fun = clamp(player.fun - 5, 0, 100);
    player.social = clamp(player.social - 8, 0, 100);
    player.job = "Freelance Developer";
    player.status = "Working";

    emitStatus(socket, "You worked hard and earned money.");
    broadcastState(socket);
  });

  socket.on("eat", () => {
    const player = players.get(socket.id);
    if (!player) return;

    if (player.money < 15) {
      emitStatus(socket, "Not enough money for food.");
      return;
    }

    player.money -= 15;
    player.hunger = clamp(player.hunger + 30, 0, 100);
    player.energy = clamp(player.energy + 10, 0, 100);
    player.status = "Eating";

    emitStatus(socket, "You ate a meal and recovered some energy.");
    broadcastState(socket);
  });

  socket.on("rest", () => {
    const player = players.get(socket.id);
    if (!player) return;

    player.energy = clamp(player.energy + 25, 0, 100);
    player.fun = clamp(player.fun + 8, 0, 100);
    player.status = "Resting";

    emitStatus(socket, "You rested and recovered energy.");
    broadcastState(socket);
  });

  socket.on("shower", () => {
    const player = players.get(socket.id);
    if (!player) return;

    player.hygiene = clamp(player.hygiene + 35, 0, 100);
    player.fun = clamp(player.fun + 4, 0, 100);
    player.status = "Fresh and clean";

    emitStatus(socket, "You took a shower and feel refreshed.");
    broadcastState(socket);
  });

  socket.on("socialize", () => {
    const player = players.get(socket.id);
    if (!player) return;

    player.social = clamp(player.social + 30, 0, 100);
    player.fun = clamp(player.fun + 20, 0, 100);
    player.money = clamp(player.money + 10, 0, Number.MAX_SAFE_INTEGER);
    player.status = "Socializing";

    emitStatus(socket, "You met new people and made friends.");
    broadcastState(socket);
  });

  socket.on("save", () => {
    const player = players.get(socket.id);
    if (!player) return;

    const saved = getUpdatedPlayer(player);
    players.set(socket.id, saved);
    socket.emit("player-state", saved);
    emitStatus(socket, `Progress saved for ${saved.name}.`);
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    io.emit("players-update", Array.from(players.values()));
    console.log("Disconnected:", socket.id);
  });
});

setInterval(() => {
  for (const player of players.values()) {
    player.hunger = clamp(player.hunger - 3, 0, 100);
    player.energy = clamp(player.energy - 2, 0, 100);
    player.hygiene = clamp(player.hygiene - 2, 0, 100);
    player.bladder = clamp(player.bladder - 3, 0, 100);
    player.fun = clamp(player.fun - 1, 0, 100);
    player.social = clamp(player.social - 1, 0, 100);

    if (player.hunger <= 15) player.status = "Hungry";
    else if (player.energy <= 15) player.status = "Tired";
    else if (player.hygiene <= 15) player.status = "Dirty";
    else if (player.bladder <= 15) player.status = "Need restroom";
    else if (hasLowStats(player)) player.status = "Unwell";
    else player.status = "Ready";
  }

  io.emit("players-update", Array.from(players.values()));
}, 4000);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

server.listen(3001, () => {
  console.log("Game server running on http://localhost:3001");
});

