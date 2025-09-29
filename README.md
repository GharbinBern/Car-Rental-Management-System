# Car Rental Management System

A modern full-stack car rental management system with React frontend, FastAPI backend, and MySQL database. Features comprehensive rental operations, customer management, vehicle tracking, and JWT authentication.

## Features

- **Web Dashboard** - Modern React interface for managing rentals, vehicles, and customers
- **JWT Authentication** - Secure login with token-based authentication
- **Vehicle Management** - Track fleet status, maintenance, and availability
- **Customer Management** - Customer profiles with rental history and loyalty programs
- **Rental Operations** - Process rentals, returns, and payments
- **Analytics & Reports** - Business insights and performance metrics
- **CLI Tools** - Command-line utilities for admin tasks and database setup

## Tech Stack

**Backend**: FastAPI (Python 3.10+), MySQL 8.x, JWT Authentication, Pydantic validation  
**Frontend**: React 18, Vite, TailwindCSS, React Router, Axios  
**Tools**: Hot reload, OpenAPI docs, CLI management utilities

## Project Structure

```
Car-Rental-Management-System/
├── api/                           # FastAPI Backend API Server
│   ├── __init__.py
│   ├── main.py
│   ├── requirements.txt
│   ├── core/                     # Core application configuration
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── middleware.py
│   │   └── schemas.py
│   └── routes/                   # API endpoint modules
│       ├── __init__.py
│       ├── auth.py
│       ├── vehicles.py
│       ├── customers.py
│       ├── rentals.py
│       ├── maintenance.py
│       ├── analytics.py
│       ├── loyalty.py
│       └── reviews.py
├── frontend/                     # React Frontend Application
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── index.html
│   └── src/                     # React source code
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── contexts/            # React context providers
│       │   └── AuthContext.jsx
│       ├── pages/               # Main application pages
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Vehicles.jsx
│       │   ├── Customers.jsx
│       │   ├── Rentals.jsx
│       │   ├── Maintenance.jsx
│       │   └── Reports.jsx
│       └── services/            # API communication layer
│           ├── api.js
│           └── auth.js
├── cli/                          # Command Line Management Tools
│   └── manage.py
├── db_layer/                     # Database Abstraction Layer
│   ├── __init__.py
│   ├── connection.py
│   └── setup.py
├── business_logic/               # Domain Business Logic
│   ├── __init__.py
│   ├── customer.py
│   ├── vehicles.py
│   ├── rentals.py
│   └── reports.py
├── sql/                          # Database Schema & Data
│   ├── schema.sql
│   ├── views.sql
│   ├── auth.sql
│   └── insert_data.sql
├── requirements.txt
├── run.py
├── create_admin_user.py
├── Makefile
├── .env.example
└── README.md
```

### Directory Breakdown

**API Layer (`api/`)**
- Houses the FastAPI backend with JWT authentication and comprehensive REST endpoints
- `core/` contains centralized configuration, middleware, and Pydantic schemas
- `routes/` implements all business endpoints with proper validation and error handling

**Frontend (`frontend/`)**
- Modern React 18 application with Vite for fast development and optimized builds
- Uses TailwindCSS for responsive design and consistent styling
- Context-based state management for authentication and global app state

**CLI Tools (`cli/`)**
- Administrative command-line utilities for user management and system operations
- Integrated with the main application for database access and business logic

**Database Layer (`db_layer/`)**
- Abstraction layer providing clean database interfaces for business logic
- Connection pooling and query optimization for production performance

**Business Logic (`business_logic/`)**
- Domain-specific business rules separated from API and database concerns
- Promotes code reusability between web API and CLI applications

**SQL Scripts (`sql/`)**
- Complete database schema with proper indexing and constraints
- Sample data and views for development and reporting

## Quick Start

### Prerequisites
- **Python 3.10+** and **Node.js 16+**
- **MySQL 8.x** (Homebrew: `brew install mysql@8.0` or Docker)
- **Conda** or **venv** for Python environment

### Setup
```bash
# 1. Clone and configure
git clone https://github.com/GharbinBern/Car-Rental-Management-System.git
cd Car-Rental-Management-System
cp .env.example .env  # Edit with your MySQL credentials

# 2. Python environment
conda create -y -n car-rental python=3.12
conda activate car-rental
pip install -r requirements.txt

# 3. Database setup
python run.py --setup-only

# 4. Create admin user
python cli/manage.py create-admin

# 5. Install frontend dependencies
cd frontend && npm install && cd ..
```

### Run the Application
```bash
make dev
```

**Access Points:**
- **Frontend**: http://localhost:3000 (Login: `admin` / `admin123`)
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/auth/health

### CLI Management

## Development

### Commands
```bash
make dev          # Start full-stack development
make backend      # Backend only (port 8000)
make frontend     # Frontend only (port 3000) 
make stop         # Stop all services
make create-admin # Create/update admin user
```

### CLI Tools
```bash
python cli/manage.py create-admin                                    # Interactive admin creation
python cli/manage.py create-admin --username admin --password pass  # Non-interactive
python run.py --setup-only                                          # Database initialization only
```

## Usage

### Web Interface
Access at http://localhost:3000 after running `make dev`. Login with `admin` / `admin123`.

### CLI Interface
```bash
python run.py          # Full setup + interactive CLI
python run.py --cli-only # CLI only (skip database setup)
```

**Available CLI Features:**
- Vehicle management (list, availability)
- Customer management (register, history)
- Rental operations (rent, return)
- Analytics and reporting

## API Documentation

With the backend running, access comprehensive API docs:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Authentication Endpoints
- `POST /api/auth/login` - Sign in with username/password
- `GET /api/auth/me` - Get current user info

### Core API Endpoints
- `GET /api/vehicles` - List all vehicles
- `GET /api/customers` - List all customers  
- `GET /api/rentals` - List all rentals
- And many more...

## Configuration

Database credentials are configured in `.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=car_rental_db
SECRET_KEY=your-secret-key-here
```
conda activate car-rental  # or: source .venv/bin/activate
uvicorn api.main:app --reload --port 8000


## System Features

### Data Management
- **Customer Codes**: Unique identifiers for customer tracking
- **Loyalty Program**: Integrated customer loyalty system
- **Vehicle Status**: Real-time availability tracking
- **Rental History**: Complete audit trail of all transactions

### Security
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **CORS Configuration**: Secure cross-origin requests
- **Request Validation**: Comprehensive input validation

### Performance
- **Database Indexing**: Optimized queries for fast response
- **Connection Pooling**: Efficient database connections
- **Frontend Optimization**: Vite build optimization
- **API Caching**: Response caching where appropriate

## Troubleshooting

**Database Connection Issues:**
```bash
brew services list | grep mysql    # Check MySQL status (macOS)
mysql -u root -p -e "SHOW DATABASES;"  # Test connection
```

**Port Conflicts:**
```bash
lsof -ti:8000 | xargs kill -9  # Free backend port
lsof -ti:3000 | xargs kill -9  # Free frontend port
```

**Fresh Install:**
```bash
# Backend: recreate Python environment
conda deactivate && conda env remove -n car-rental
conda create -y -n car-rental python=3.12 && conda activate car-rental
pip install -r requirements.txt

# Frontend: clear npm cache
cd frontend && rm -rf node_modules package-lock.json
npm cache clean --force && npm install
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

Star this repository if you find it helpful!

