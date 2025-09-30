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
├── run.py                        # CLI operations (database, admin tasks)
├── Makefile                      # Web development (browser-based work)
├── .env.example                  # Environment variables template
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
└── backend/                      # All Backend Components
    ├── .env                      # Backend configuration
    ├── requirements.txt          # Backend dependencies
    ├── api/                      # FastAPI Backend API Server
    │   ├── main.py
    │   ├── core/                 # Core application configuration
    │   │   ├── config.py
    │   │   └── middleware.py
    │   └── routes/               # API endpoint modules
    │       ├── auth.py
    │       ├── vehicles.py
    │       ├── customers.py
    │       ├── rentals.py
    │       ├── maintenance.py
    │       ├── analytics.py
    │       ├── loyalty.py
    │       └── reviews.py
    ├── cli/                      # Command Line Management Tools
    │   ├── interactive.py        # Interactive CLI interface
    │   ├── manage.py             # Admin utilities (create users, etc.)
    │   └── services/             # CLI business functions
    │       ├── customers.py      # Customer CLI operations
    │       ├── vehicles.py       # Vehicle CLI operations
    │       ├── rentals.py        # Rental CLI operations
    │       └── analytics.py      # Reporting CLI operations
    ├── database/                 # Database Management
    │   ├── connection.py         # MySQL connection & pooling
    │   └── setup.py              # Database initialization
    └── sql/                      # Database Schema & Data
        ├── schema.sql
        ├── views.sql
        ├── auth.sql
        └── insert_data.sql
```

### Directory Breakdown

**Frontend (`frontend/`)**
- Modern React 18 application with Vite for fast development and optimized builds
- Uses TailwindCSS for responsive design and consistent styling
- Context-based state management for authentication and global app state

**Backend (`backend/`)**
- All server-side components organized in one location
- Clean separation between API routes, CLI tools, and database management

**API Layer (`backend/api/`)**
- FastAPI backend with JWT authentication and comprehensive REST endpoints
- `core/` contains centralized configuration and middleware
- `routes/` implements all business endpoints with proper validation and error handling

**CLI Tools (`backend/cli/`)**
- Interactive CLI interface and admin management utilities
- `services/` contains CLI-specific business functions
- Integrated with database and separate from web API logic

**Database (`backend/database/`)**
- MySQL connection management with connection pooling
- Database initialization and schema setup utilities

**SQL Scripts (`backend/sql/`)**
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
pip install -r backend/requirements.txt

# 3. Database setup
python run.py --setup-only

# 4. Create admin user
python backend/cli/manage.py create-admin

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

## Commands

### Development
```bash
make dev          # Start full-stack development
make backend      # Backend only (port 8000)
make frontend     # Frontend only (port 3000) 
make stop         # Stop all services
```

### Database & Admin
```bash
python run.py --setup-only                           # Initialize database
python backend/cli/manage.py create-admin            # Create admin user
make create-admin                                    # Create admin (via Makefile)
```

### Interactive CLI
```bash
python run.py          # Full setup + interactive CLI
python run.py --cli-only # CLI only (skip database setup)
```

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

Database credentials are configured in `backend/.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=car_rental_db
SECRET_KEY=your-secret-key-here
```

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
pip install -r backend/requirements.txt

# Frontend: clear npm cache
cd frontend && rm -rf node_modules package-lock.json
npm cache clean --force && npm install
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

Star this repository if you find it helpful!

