"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { io } from "socket.io-client";

export default function Home() {
  const gameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    let socket: any;
    let player: Phaser.GameObjects.Rectangle;
    const otherPlayers = new Map<string, Phaser.GameObjects.Rectangle>();

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 960,
      height: 600,
      backgroundColor: "#7ec850",
      scene: {
        create() {
          const graphics = this.add.graphics();
          graphics.fillStyle(0x4f8f3d, 1);
          graphics.fillRect(0, 0, 960, 600);

          player = this.add.rectangle(120, 120, 24, 24, 0x2d6cdf);

          socket = io("http://localhost:3001");
          socket.emit("join-game", { name: "Player1" });

          socket.on("players-update", (players: any[]) => {
            const currentIds = new Set<string>();

            players.forEach((p) => {
              currentIds.add(p.id);

              if (p.id === socket.id) {
                player.x = p.x;
                player.y = p.y;
                return;
              }

              if (!otherPlayers.has(p.id)) {
                const sprite = this.add.rectangle(p.x, p.y, 24, 24, 0xffa500);
                otherPlayers.set(p.id, sprite);
              } else {
                const sprite = otherPlayers.get(p.id)!;
                sprite.x = p.x;
                sprite.y = p.y;
              }
            });

            for (const [id, sprite] of otherPlayers.entries()) {
              if (!currentIds.has(id)) {
                sprite.destroy();
                otherPlayers.delete(id);
              }
            }
          });
        },

        update() {
          const cursors = this.input.keyboard.createCursorKeys();
          let dx = 0;
          let dy = 0;

          if (cursors.left?.isDown) dx = -4;
          if (cursors.right?.isDown) dx = 4;
          if (cursors.up?.isDown) dy = -4;
          if (cursors.down?.isDown) dy = 4;

          player.x += dx;
          player.y += dy;

          if (dx !== 0 || dy !== 0) {
            socket.emit("move", { x: player.x, y: player.y });
          }
        },
      },
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
      socket?.disconnect();
    };
  }, []);

  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        background: "#0f172a",
      }}
    >
      <div ref={gameRef} />
    </main>
  );
}
