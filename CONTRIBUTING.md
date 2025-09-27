# Contributing & Local Setup

This project uses a Python backend (CLI + optional FastAPI wrapper) and a React + Vite frontend. Follow these steps to set up a local dev environment.

1) Python backend

```bash
# create & activate a virtual environment (macOS / zsh)
python3 -m venv .venv
source .venv/bin/activate

# install API dependencies
pip install -r api/requirements.txt

# run the API server
uvicorn api.main:app --reload
```

2) Frontend

```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

Notes:
- The repository `.gitignore` excludes `.venv/` and `node_modules/`. Do not commit these directories.
- Database: update credentials in `db_layer/connection.py` if needed. Run `sql/schema.sql` and `sql/insert_data.sql` to populate your local MySQL database.
- If you prefer Docker for reproducible environments, consider adding a `Dockerfile` and `docker-compose.yml`.
