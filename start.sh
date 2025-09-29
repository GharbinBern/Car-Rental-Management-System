#!/usr/bin/env zsh
set -euo pipefail

# One-command dev runner for Car Rental Management System
# Starts FastAPI backend (Uvicorn) and Vite frontend concurrently.

# Activate conda env if available
if command -v conda >/dev/null 2>&1; then
  eval "$(conda shell.zsh hook)"
  # Activate dev env if it exists; ignore if it doesn't
  conda activate car-rental 2>/dev/null || true
fi

# Warn if .env is missing
if [ ! -f ./.env ]; then
  echo "[warn] .env not found in project root. If needed, copy .env.example to .env"
fi

# Ensure ports are free
if lsof -ti:8000 >/dev/null 2>&1; then
  echo "[info] Freeing port 8000"
  lsof -ti:8000 | xargs -r kill -9 || true
fi
if lsof -ti:3000 >/dev/null 2>&1; then
  echo "[info] Freeing port 3000"
  lsof -ti:3000 | xargs -r kill -9 || true
fi

BACKEND_CMD=(uvicorn api.main:app --reload --port 8000)
FRONTEND_CMD=(npm run dev -- --port 3000 --strictPort --host)

pids=()

cleanup() {
  echo "\n[info] Shutting down dev servers..."
  for pid in $pids; do
    kill -9 $pid 2>/dev/null || true
  done
  exit 0
}
trap cleanup INT TERM

echo "[start] Backend: http://127.0.0.1:8000"
(${=BACKEND_CMD}) &
pids+=$!

echo "[start] Frontend: http://localhost:3000"
(cd frontend && ${=FRONTEND_CMD}) &
pids+=$!

echo "[info] Press Ctrl+C to stop both servers."
wait
