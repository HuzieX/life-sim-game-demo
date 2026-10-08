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

## Phase 3: persistence and save systems

This version adds a stronger game foundation with:
- structured player state
- optional Prisma persistence
- local save fallback for development
- quest and inventory tracking
- server-driven game loop

### Prisma setup (optional)

Create a PostgreSQL database and add a `.env` file in the `server/` folder:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lifesim?schema=public"
```

Then run:

```bash
cd server
npx prisma generate
npx prisma db push
```

### Local file save fallback

If PostgreSQL is not running, the server will still work and persist state to a local JSON file in `server/data/saves.json`.

## Notes

This project is now a playable life-sim prototype with:
- character creation screen
- movement, location, and status tracking
- jobs and income actions
- inventory and quest tracking
- in-memory multiplayer state
- data persistence support
