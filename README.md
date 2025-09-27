# Car Rental Management System

A Python command-line car rental system backed by MySQL. The project provides basic rental operations, customer management, promotions, and branch reporting. It was built as a small demo/utility and is structured to be easily extended.

## Quick overview
- CLI-based interface (entry point: `run.py`) that calls business logic in `business_logic/`.
- Database access via helper in `db_layer/`.
- SQL schema and sample data in `sql/` (including views and seed data).

## Technologies
- Python 3.10+ (tested with 3.11+)
- MySQL (8.x recommended)
- Minimal Python stdlib and MySQL connector (see dependencies)

## What the repo contains
- `run.py` — CLI entrypoint
- `business_logic/` — modules for vehicles, customers, rentals, reports, promos
- `db_layer/` — DB connection and setup helpers
- `sql/` — `schema.sql`, `insert_data.sql`, `views.sql` (schema + seeds + views)

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
