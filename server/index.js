html,
body {
  margin: 0;
  padding: 0;
  min-height: 100%;
  font-family: Arial, Helvetica, sans-serif;
  background: #020817;
  color: #e2e8f0;
}

* {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
}

button,
input {
  font: inherit;
}

.login-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at top, #1e293b, #0f172a 48%);
}

.panel {
  width: min(420px, 90vw);
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 20px;
  padding: 30px 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.35);
}

.eyebrow {
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  color: #7dd3fc;
  font-weight: 700;
}

h1 {
  margin: 12px 0 8px;
  font-size: clamp(2rem, 5vw, 2.8rem);
}

p {
  margin: 0 0 22px;
  color: #cbd5e1;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #e2e8f0;
  font-weight: 700;
}

input {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #334155;
  background: #0f172a;
  color: white;
  padding: 0 14px;
  margin-bottom: 18px;
  outline: none;
}

input:focus {
  border-color: #7dd3fc;
  box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.2);
}

button {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.game-shell {
  min-height: 100vh;
  background: #020817;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px;
}

.hud {
  width: min(1200px, 96vw);
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 12px;
}

.hud-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-weight: 700;
  margin-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  color: #cbd5e1;
  font-size: 0.92rem;
}

.action-bar {
  width: min(1200px, 96vw);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.action-bar button {
  height: 44px;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
}

.status-panel {
  width: min(1200px, 96vw);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  margin-bottom: 12px;
  color: #cbd5e1;
  flex-wrap: wrap;
}

.game-stage {
  width: min(1200px, 96vw);
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: #111827;
}

canvas {
  display: block;
  width: 100% !important;
  height: auto !important;
}

@media (max-width: 720px) {
  .panel {
    padding: 22px 18px;
  }

  .hud,
  .status-panel {
    padding: 12px 14px;
  }
}

