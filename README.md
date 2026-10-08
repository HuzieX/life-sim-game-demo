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

## Phase 2: persistent player state

This project now includes a PostgreSQL-ready Prisma schema for persistent player data and a fallback in-memory mode so the game still works without a database.

### Database setup

Create a PostgreSQL database and add a `.env` file inside `server/`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lifesim?schema=public"
```

Then run:

```bash
cd server
npx prisma generate
npx prisma db push
```

## Notes

This starter prototype includes:
- Phaser canvas
- Socket.IO movement sync
- multiplayer updates
- basic persistent player state using Prisma
- in-memory fallback for local testing without a running database
