# Prestige Drive: Luxury Car Rental Management

A full-stack car rental management platform built for premium cars. Clean BMW-inspired UI, secure JWT authentication, and a public demo.

**Live demo:** use `demo / demo123` — read-only access to the full interface.

---

## Features

- **Dashboard** — occupancy rate, revenue charts, overdue alerts, recent activity
- **Vehicle inventory** — card grid with SVG silhouettes by type, daily rate, fuel & transmission specs
- **Rentals** — full booking lifecycle, duration tracking, overdue detection, one-click return
- **Customers** — loyalty tiers, license & country records, edit-in-place
- **Maintenance** — per-vehicle service health, cumulative cost tracking, scheduled service log
- **Reports** — revenue trend (bar), rental volume (area), vehicle breakdown (donut), branch breakdown, CSV export
---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Lucide |
| Backend | FastAPI (Python 3.12), Pydantic v2, python-jose |
| Database | MySQL 8.x |
| Auth | JWT (HS256), bcrypt password hashing |
| Font | DM Sans (Google Fonts) |

---

## Project Structure

```
├── .env.example                  # Copy to backend/.env and fill in values
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Sidebar layout, demo banner, toast
│   │   ├── contexts/AuthContext.jsx
│   │   ├── pages/                # Dashboard, Vehicles, Rentals, Customers,
│   │   │                         # Maintenance, Reports, Login
│   │   └── services/             # api.js (axios + interceptors), auth.js
│   ├── tailwind.config.js
│   └── vite.config.js            # Dev proxy: /api → localhost:8000
└── backend/
    ├── .env                      # Local secrets (gitignored)
    ├── .env.example              # Template for environment variables
    ├── requirements.txt
    ├── api/
    │   ├── main.py               # FastAPI app, CORS, demo middleware, lifespan
    │   ├── core/config.py        # Pydantic settings with startup validation
    │   └── routes/               # auth, vehicles, customers, rentals,
    │                             # maintenance, analytics, loyalty, reviews
    ├── database/connection.py
    └── sql/
        ├── schema.sql
        ├── auth.sql              # users table + default admin
        ├── views.sql
        └── insert_data.sql       # Prestige Drive demo data (relative dates)
```

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- MySQL 8.x

### 1. Clone and configure

```bash
git clone https://github.com/GharbinBern/Car-Rental-Management-System.git
cd Car-Rental-Management-System

cp .env.example backend/.env
```

### 2. Backend

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# Seed the database
mysql -u root -p car_rental_db < backend/sql/schema.sql
mysql -u root -p car_rental_db < backend/sql/auth.sql
mysql -u root -p car_rental_db < backend/sql/views.sql
mysql -u root -p car_rental_db < backend/sql/insert_data.sql

# Start
cd backend
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

Vite proxies `/api` → `http://localhost:8000` — no CORS configuration needed locally.

---


## Environment Variables

Copy `.env.example` to `backend/.env` and fill in:

```env
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# Generate with: openssl rand -hex 32
SECRET_KEY=your_secret_key_min_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

FRONTEND_URL=your_frontend_url
```

The app refuses to start if `SECRET_KEY` is missing, empty, or under 32 characters.

---

## API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Sign in, returns JWT |
| POST | `/api/auth/register` | Create user (auth required) |
| GET | `/api/vehicles/` | List vehicles |
| PUT | `/api/vehicles/{code}` | Update vehicle |
| GET | `/api/rentals/` | List rentals (effective status computed) |
| POST | `/api/rentals/` | Create rental |
| POST | `/api/rentals/{id}/return` | Return vehicle |
| GET | `/api/customers/` | List customers |
| GET | `/api/analytics/dashboard` | KPIs |
| GET | `/api/analytics/revenue` | Revenue by period |
| GET | `/api/analytics/fleet-status` | Vehicle overview |

Full interactive docs at `http://localhost:8000/docs`.

---

## Security

- Passwords hashed with **bcrypt** (cost 12); legacy SHA-256 hashes auto-migrated on login
- JWT signed with HS256; secret validated at startup — weak keys are rejected
- All routes require authentication; demo account blocked from writes by middleware

---

## Troubleshooting

**MySQL not running**
```bash
brew services start mysql          # macOS
sudo service mysql start           # Linux
```

**Port already in use**
```bash
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

