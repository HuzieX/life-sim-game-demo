const fs = require("fs");
const path = require("path");

const directory = path.join(__dirname, "data");
const filePath = path.join(directory, "saves.json");

function ensureDirectory() {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function readSaves() {
  ensureDirectory();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
    return {};
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content || "{}");
  } catch (error) {
    return {};
  }
}

function writeSaves(data) {
  ensureDirectory();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  readSaves,
  writeSaves,
  filePath,
};
