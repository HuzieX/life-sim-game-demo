# Life Sim Game Demo

A multiplayer life simulation game prototype built with Next.js, Phaser, and Socket.IO.

## Project structure

- `src/app` – frontend game UI and Phaser canvas
- `server` – multiplayer Socket.IO game server

## Local setup

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Start the game server:
   ```bash
   cd server
   npm start
   ```

4. Start the frontend:
   ```bash
   cd ..
   npm run dev
   ```

5. Open http://localhost:3000

## Notes

This is a starter prototype for a life-sim multiplayer game. It includes:
- Phaser canvas
- Socket.IO movement sync
- basic player updates between clients
- server/client architecture foundation
