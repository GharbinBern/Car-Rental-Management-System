# Car Rental Management System

This is a full-stack car rental management platform built to handle the complete operational lifecycle of a premium vehicle rental business. The system runs a React frontend backed by a FastAPI Python server and a MySQL database, with JWT authentication securing all user sessions. A [Live Demo](https://car-rental-management-system-teal.vercel.app/) is available, log in with `demo / demo123` for read-only access to the full interface.

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Lucide |
| Backend | FastAPI (Python 3.12), Pydantic v2, python-jose |
| Database | MySQL 8.x |
| Auth | JWT (HS256), bcrypt password hashing |

## Quick Start

**Prerequisites:** Python 3.12+, Node.js 18+, MySQL 8.x

**1. Clone and configure**
```bash
git clone https://github.com/GharbinBern/Car-Rental-Management-System.git
cd Car-Rental-Management-System
cp .env.example backend/.env
```

**2. Backend**
```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

mysql -u root -p car_rental_db < backend/sql/schema.sql
mysql -u root -p car_rental_db < backend/sql/auth.sql
mysql -u root -p car_rental_db < backend/sql/views.sql
mysql -u root -p car_rental_db < backend/sql/insert_data.sql

cd backend
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```
