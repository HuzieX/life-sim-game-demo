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
const inventoryCatalog = {
  Coffee: { value: 12, type: "consumable" },
  Snack: { value: 8, type: "consumable" },
  Book: { value: 20, type: "utility" },
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function defaultQuests() {
  return [
    { id: "q1", title: "Earn your first $100", progress: 0, goal: 100, completed: false },
    { id: "q2", title: "Keep your needs above 50", progress: 100, goal: 100, completed: true },
  ];
}

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
    inventory: [
      { name: "Coffee", quantity: 1, value: 12 },
      { name: "Snack", quantity: 1, value: 8 },
    ],
    quests: defaultQuests(),
  };
}

function updatePlayerProgress(player) {
  if (player.experience >= player.level * 100) {
    player.level += 1;
    player.experience = 0;
    player.status = "Level up!";
  }

  const questGoal = player.quests?.find((q) => q.id === "q1");
  if (questGoal && player.money >= 100) {
    questGoal.progress = 100;
    questGoal.completed = true;
  }

  return player;
}

function computeLocation(x) {
  if (x < 300) return "City Center";
  if (x < 600) return "Downtown";
  return "Suburbs";
}

function serializePlayer(player) {
  return {
    id: player.id,
    name: player.name,
    x: player.x,
    y: player.y,
    money: player.money,
    level: player.level,
    experience: player.experience,
    hunger: clamp(player.hunger, 0, 100),
    energy: clamp(player.energy, 0, 100),
    hygiene: clamp(player.hygiene, 0, 100),
    fun: clamp(player.fun, 0, 100),
    social: clamp(player.social, 0, 100),
    bladder: clamp(player.bladder, 0, 100),
    job: player.job,
    location: player.location,
    status: player.status,
  };
}

function getGameState(player) {
  return {
    player: serializePlayer(player),
    inventory: player.inventory || [],
    quests: player.quests || defaultQuests(),
    message: player.message || "Welcome to the city.",
  };
}

function emitGameState(socket) {
  if (!socket) return;
  const player = players.get(socket.id);
  if (!player) return;

  socket.emit("game-state", getGameState(player));
}

function emitStatus(socket, message) {
  const player = players.get(socket.id);
  if (!player) return;
  player.message = message;
  socket.emit("game-state", getGameState(player));
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

    player.message = `Welcome, ${player.name}!`;
    players.set(socket.id, player);
    socket.emit("game-state", getGameState(player));
    io.emit("players-update", Array.from(players.values()).map(serializePlayer));
  });

  socket.on("move", ({ x, y }) => {
    const player = players.get(socket.id);
    if (!player) return;

    player.x = clamp(Number(x) || 120, 20, 920);
    player.y = clamp(Number(y) || 120, 70, 560);
    player.location = computeLocation(player.x);
    player.message = `You are now in ${player.location}.`;

    io.emit("players-update", Array.from(players.values()).map(serializePlayer));
    emitGameState(socket);
  });

  socket.on("work", () => {
    const player = players.get(socket.id);
    if (!player) return;

    if (player.energy < 20) {
      player.message = "You are too tired to work.";
      emitGameState(socket);
      return;
    }

    const payout = 80 + player.level * 15;
    player.money += payout;
    player.experience += 25;
    player.energy = clamp(player.energy - 18, 0, 100);
    player.hunger = clamp(player.hunger - 12, 0, 100);
    player.fun = clamp(player.fun - 5, 0, 100);
    player.social = clamp(player.social - 8, 0, 100);
    player.job = player.job || "Freelance Developer";
    player.status = "Working";
    player.message = `You worked and earned $${payout}.`;

    updatePlayerProgress(player);
    emitGameState(socket);
    io.emit("players-update", Array.from(players.values()).map(serializePlayer));
  });

  socket.on("eat", () => {
    const player = players.get(socket.id);
    if (!player) return;

    if (player.money < 15) {
      player.message = "You do not have enough money for food.";
      emitGameState(socket);
      return;
    }

    player.money -= 15;
    player.hunger = clamp(player.hunger + 30, 0, 100);
    player.energy = clamp(player.energy + 10, 0, 100);
    player.status = "Eating";
    player.message = "You ate a meal and recovered some energy.";

    emitGameState(socket);
  });

  socket.on("rest", () => {
    const player = players.get(socket.id);
    if (!player) return;

    player.energy = clamp(player.energy + 25, 0, 100);
    player.fun = clamp(player.fun + 8, 0, 100);
    player.status = "Resting";
    player.message = "You rested and recovered energy.";

    emitGameState(socket);
  });

  socket.on("shower", () => {
    const player = players.get(socket.id);
    if (!player) return;

    player.hygiene = clamp(player.hygiene + 35, 0, 100);
    player.fun = clamp(player.fun + 4, 0, 100);
    player.status = "Fresh and clean";
    player.message = "You took a shower and feel refreshed.";

    emitGameState(socket);
  });

  socket.on("socialize", () => {
    const player = players.get(socket.id);
    if (!player) return;

    player.social = clamp(player.social + 30, 0, 100);
    player.fun = clamp(player.fun + 20, 0, 100);
    player.money = clamp(player.money + 10, 0, Number.MAX_SAFE_INTEGER);
    player.status = "Socializing";
    player.message = "You met people and made friends.";

    emitGameState(socket);
  });

  socket.on("apply-job", ({ job } = {}) => {
    const player = players.get(socket.id);
    if (!player) return;

    const validJobs = ["Freelance Developer", "Courier", "Barista"];
    const nextJob = validJobs.includes(job) ? job : "Freelance Developer";
    player.job = nextJob;
    player.message = `You started working as a ${nextJob}.`;

    emitGameState(socket);
  });

  socket.on("buy-item", ({ item } = {}) => {
    const player = players.get(socket.id);
    if (!player) return;

    const entry = inventoryCatalog[item];
    if (!entry) {
      player.message = "That item does not exist.";
      emitGameState(socket);
      return;
    }

    if (player.money < entry.value) {
      player.message = `You need $${entry.value} for ${item}.`;
      emitGameState(socket);
      return;
    }

    player.money -= entry.value;
    const current = player.inventory.find((i) => i.name === item);
    if (current) {
      current.quantity += 1;
    } else {
      player.inventory.push({ name: item, quantity: 1, value: entry.value });
    }

    player.message = `You bought ${item}.`;
    emitGameState(socket);
  });

  socket.on("save", () => {
    const player = players.get(socket.id);
    if (!player) return;

    const saved = updatePlayerProgress(player);
    players.set(socket.id, saved);
    player.message = `Progress saved for ${player.name}.`;
    emitGameState(socket);
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    io.emit("players-update", Array.from(players.values()).map(serializePlayer));
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
    else if (player.hunger < 40 || player.energy < 40 || player.hygiene < 40) {
      player.status = "Needs attention";
    } else {
      player.status = "Ready";
    }

    if (player.money >= 100) {
      const q1 = player.quests.find((quest) => quest.id === "q1");
      if (q1 && !q1.completed) {
        q1.progress = Math.min(100, player.money);
        q1.completed = player.money >= q1.goal;
      }
    }
  }

  io.emit("players-update", Array.from(players.values()).map(serializePlayer));
}, 4000);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

server.listen(3001, () => {
  console.log("Game server running on http://localhost:3001");
});

