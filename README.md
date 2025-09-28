# Car Rental Management System

A complete full-stack car rental management system featuring a modern React frontend, robust FastAPI backend, and MySQL database. The system provides comprehensive rental operations, customer management, vehicle tracking, authentication, and both web and CLI interfaces.

## ✨ Features

### 🖥️ **Web Application**
- **JWT Authentication** - Secure user login and session management
- **Dashboard** - Overview of rentals, vehicles, and customer statistics  
- **Vehicle Management** - Add, edit, and track vehicle inventory with real-time status
- **Customer Management** - Complete customer profiles with rental history
- **Rental Operations** - Process rentals and returns with automated calculations
- **Responsive Design** - Modern UI that works on desktop and mobile

### 🖥️ **CLI Interface**
- **Interactive Menu** - User-friendly command-line interface
- **Database Setup** - Automated database initialization with sample data
- **Flexible Modes** - Setup-only, CLI-only, or combined operation modes
- **Comprehensive Help** - Built-in documentation and usage examples

### 🔧 **System Features**
- **Real-time Data** - Live database connectivity with immediate updates
- **Schema Validation** - Robust data validation with Pydantic models
- **CORS Support** - Configured for multiple development environments
- **Error Handling** - Comprehensive error management and user feedback

## 🛠️ Tech Stack

### Backend
- **FastAPI** (Python 3.10+) - High-performance API framework
- **MySQL 8.x** - Reliable relational database
- **JWT Authentication** - Secure token-based authentication
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server for production-ready deployment

### Frontend  
- **React 18** - Modern component-based UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **React Router** - Client-side routing for single-page application
- **Axios** - HTTP client with request/response interceptors

### Development Tools
- **Comprehensive CLI** - Database setup and management tools
- **Hot Reload** - Instant development feedback
- **API Documentation** - Auto-generated OpenAPI/Swagger docs

## 📁 Project Structure

```
Car-Rental-Management-System/
├── 🎯 api/                     # FastAPI Backend
│   ├── routes/                 # API endpoint modules
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── vehicles.py        # Vehicle management
│   │   ├── customers.py       # Customer operations
│   │   ├── rentals.py         # Rental processing
│   │   └── ...                # Additional endpoints
│   ├── main.py                # FastAPI application setup
│   ├── config.py              # Application configuration
│   └── schemas.py             # Pydantic data models
├── 🎨 frontend/               # React Frontend
│   ├── src/
│   │   ├── pages/            # React page components
│   │   │   ├── Dashboard.jsx # Main dashboard
│   │   │   ├── Login.jsx     # Authentication
│   │   │   ├── Vehicles.jsx  # Vehicle management
│   │   │   └── Customers.jsx # Customer management
│   │   ├── contexts/         # React context providers
│   │   │   └── AuthContext.jsx # Authentication state
│   │   ├── services/         # API integration
│   │   │   └── auth.js       # Authentication service
│   │   ├── App.jsx           # Main React application
│   │   └── main.jsx          # Application entry point
│   ├── index.html            # HTML template
│   ├── package.json          # Node.js dependencies
│   └── tailwind.config.cjs   # Tailwind CSS configuration
├── 💾 db_layer/               # Database Management
│   ├── connection.py         # Database connection utilities
│   └── setup.py              # Database initialization
├── 🗃️ sql/                   # SQL Scripts
│   ├── schema.sql            # Database schema
│   ├── insert_data.sql       # Sample data
│   ├── views.sql             # Database views
│   └── auth.sql              # User authentication tables
├── 🖥️ cli/                   # Command Line Interface
│   └── main_cli.py           # Interactive CLI application
├── 📋 business_logic/        # Core Business Logic
├── 🚀 run.py                 # CLI Entry Point with argument parsing
└── 📚 README.md              # This documentation
```

## 🚀 Quick Start

### 📋 Prerequisites
- **Python 3.10+** - For backend API server
- **Node.js 16+** - For frontend development
- **MySQL 8.x** - Database server

### ⚡ One-Command Setup

The fastest way to get started:

```bash
# Clone the repository
git clone https://github.com/GharbinBern/Car-Rental-Management-System.git
cd Car-Rental-Management-System

# Setup database and start CLI (with automatic dependency installation)
python run.py
```

### 🔧 Manual Setup

#### 1. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start the backend API server
uvicorn api.main:app --reload
```

#### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev --port 3000
```

#### 3. Database Setup

**Option A: Automated Setup (Recommended)**
```bash
# Use the CLI tool for complete database setup
python run.py --setup-only
```

**Option B: Manual Database Setup**
```bash
# Create database in MySQL
mysql -u root -p -e "CREATE DATABASE car_rental_db;"

# Configure database connection in db_layer/connection.py
# Then initialize the database
python -c "from db_layer.setup import init_database; init_database()"
```

## 🎮 Usage

### 🌐 **Web Application**
1. Start the backend: `uvicorn api.main:app --reload`
2. Start the frontend: `cd frontend && npm run dev -- --port 3000`
3. Open browser: `http://localhost:3000`
4. **Login credentials**: `admin` / `admin123`

### 🖥️ **CLI Application**

**Interactive Mode (Default)**
```bash
python run.py                    # Full setup + CLI
```

**Available CLI Options**
```bash
python run.py --setup-only       # Only setup database
python run.py --cli-only         # Only start CLI (skip setup)
python run.py --skip-setup       # Start CLI without database setup
python run.py --help            # Show all available options
```

**CLI Features:**
- 🚗 List Available Vehicles
- 📋 List All Vehicles  
- 👥 List All Customers
- ✍️ Register New Customer
- 🔄 Rent a Vehicle
- ↩️ Return a Vehicle
- 📊 View Branch Statistics
- 📜 View Customer History

## 🔗 API Documentation

With the backend running, access comprehensive API docs:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 🔐 Authentication Endpoints
- `POST /api/auth/login` - Sign in with username/password
- `GET /api/auth/me` - Get current user info

### 🚗 Core API Endpoints  
- `GET /api/vehicles` - List all vehicles
- `GET /api/customers` - List all customers  
- `GET /api/rentals` - List all rentals
- And many more...

## ⚙️ Configuration

### Database Connection
Update `db_layer/connection.py` with your MySQL credentials:
```python
DB_CONFIG = {
    'host': 'localhost',
    'user': 'your_username', 
    'password': 'your_password',
    'database': 'car_rental_db'
}
```

### Environment Variables
Create a `.env` file for sensitive configuration:
```env
DATABASE_URL=mysql://user:password@localhost/car_rental_db
SECRET_KEY=your-secret-key-here
```

## 🛠️ Development

### 🔄 **Development Workflow**
```bash
# Terminal 1: Backend with hot reload
uvicorn api.main:app --reload

# Terminal 2: Frontend with hot reload  
cd frontend && npm run dev -- --port 3000

# Terminal 3: Database operations
python run.py --cli-only
```

### 🧪 **Testing**
```bash
# Test backend API endpoints
curl http://localhost:8000/api/vehicles

# Test frontend build
cd frontend && npm run build

# Test database connectivity
python -c "from db_layer.connection import connect_db; print('✅ Database connected!' if connect_db() else '❌ Connection failed')"
```

## 📊 **System Features**

### 🔍 **Data Management**
- **Customer Codes**: Unique identifiers for customer tracking
- **Loyalty Program**: Integrated customer loyalty system
- **Vehicle Status**: Real-time availability tracking
- **Rental History**: Complete audit trail of all transactions

### 🔒 **Security**
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **CORS Configuration**: Secure cross-origin requests
- **Request Validation**: Comprehensive input validation

### 📈 **Performance**
- **Database Indexing**: Optimized queries for fast response
- **Connection Pooling**: Efficient database connections
- **Frontend Optimization**: Vite build optimization
- **API Caching**: Response caching where appropriate

## 🚨 Troubleshooting

### Common Issues & Solutions

**🔌 Database Connection Errors**
```bash
# Check MySQL service status
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Test connection manually
mysql -u root -p -e "SHOW DATABASES;"
```

**🚫 Port Already in Use**
```bash
# Find and kill processes using ports
lsof -ti:8000 | xargs kill -9  # Backend port
lsof -ti:3000 | xargs kill -9  # Frontend port
```

**📦 Node.js/npm Issues**
```bash
# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**🐍 Python Virtual Environment Issues**
```bash
# Recreate virtual environment
rm -rf .venv
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### 📝 **Development Guidelines**
- Follow PEP 8 for Python code
- Use ESLint for JavaScript code
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** - For the excellent Python web framework
- **React** - For the powerful frontend library
- **Tailwind CSS** - For the utility-first CSS framework
- **MySQL** - For reliable data storage

---

⭐ **Star this repository if you find it helpful!**

