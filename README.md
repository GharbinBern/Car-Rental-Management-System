# Car Rental Management System

A full-stack car rental management system with a FastAPI backend, React frontend, and MySQL database. The system provides comprehensive rental operations, customer management, vehicle maintenance tracking, loyalty programs, promotions, and detailed reporting.

## Features

- User Authentication & Authorization
- Vehicle Management
- Customer Management
- Rental Operations
- Maintenance Tracking
- Loyalty Program
- Promotional Offers
- Review System
- Detailed Reporting

## Tech Stack

### Backend
- FastAPI (Python 3.10+)
- MySQL 8.x
- JWT Authentication
- Pydantic for data validation

### Frontend
- React 18
- Tailwind CSS
- React Router for navigation
- Axios for API communication

## Project Structure

```
.
├── api/                    # FastAPI backend
│   ├── routes/            # API endpoints
│   ├── schemas.py         # Pydantic models
│   └── config.py          # Configuration
├── frontend/              # React frontend
│   ├── src/
│   │   ├── pages/        # React components
│   │   ├── contexts/     # React contexts
│   │   └── services/     # API services
│   └── package.json
├── db_layer/             # Database management
├── sql/                  # SQL scripts
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 16+
- MySQL 8.x

### Backend Setup
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend
uvicorn api.main:app --reload
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Database Setup
```bash
# Configure your database connection in db_layer/connection.py
python -c "from db_layer.setup import initialize_database; initialize_database()"
```

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Setup (local)
1. Install Python 3.10+.
2. Create a virtual environment and activate it:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Install MySQL (or use a running MySQL server). Create a database for the project:

```sql
CREATE DATABASE car_rental_db;
USE car_rental_db;
```

4. Load the schema and sample data (run from project root):

```bash
# Import schema
mysql -u <user> -p car_rental_db < sql/schema.sql
# Import sample data
mysql -u <user> -p car_rental_db < sql/insert_data.sql
```

Note: `insert_data.sql` is idempotent in places (uses `INSERT IGNORE`) but may still fail if the schema or expected IDs differ — for clean test runs use a fresh database.

## Configuration
- Database connection settings are in `db_layer/connection.py`. Update the host, user, password, and database name to match your environment.

## Running the CLI
With the virtual environment activated and DB ready:

```bash
python run.py
```

The CLI menu supports:
- List Available Vehicles
- List All Vehicles
- List All Customers
- Register New Customer
- Rent a Vehicle
- Return a Vehicle
- View Branch Stats
- View Customer History
- Exit

## Notes about data and behavior
- `Customer.customer_code` is currently a UNIQUE string provided at registration. If you prefer automatic codes, update `register_customer()` in `business_logic/customer.py`.
- Loyalty members are stored in the `LoyaltyProgram` table and linked by `customer_id`.
- Views are provided in `sql/views.sql` (e.g., `branch_view`) and used by reporting functions.

## Troubleshooting
- Duplicate key 1062 on insert: likely the script was re-run on a DB with existing records. Use a fresh database or check the conflicting unique column value.
- Foreign key constraint errors: ensure `sql/schema.sql` ran successfully and sample rows were inserted in the correct order (or set `FOREIGN_KEY_CHECKS=0` during import as the schema does).
- Connection errors: verify credentials in `db_layer/connection.py` and that MySQL is running and accessible.

## Development tips
- Add tests for business logic in `business_logic/` to validate SQL results and formatting.
- Consider using SQLAlchemy or an ORM if you want to abstract SQL and improve portability.

## Contact / Contribution
PRs welcome. Open issues if you find bugs or have feature requests.

## Sprint 1: FastAPI wrapper and React + Vite frontend

This repo now contains a small FastAPI wrapper under `api/` and a React + Vite frontend scaffold in `frontend/` (Tailwind CSS).

Run the API (requires Python 3.10+):

```bash
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn
uvicorn api.main:app --reload
```

Run the frontend (requires Node 18+ / npm):

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API to run on http://localhost:8000 by default.

