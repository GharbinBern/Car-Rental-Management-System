'''
handles the database connection and creation
'''

import os
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

# Database configuration (read from env with sensible defaults)
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "car_rental_db"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "allow_local_infile": True,
    "autocommit": True,
    "connect_timeout": 5,
    "connection_timeout": 5,
}

# Create connection pool for better performance
try:
    connection_pool = pooling.MySQLConnectionPool(
        pool_name="car_rental_pool",
        pool_size=10,
        pool_reset_session=True,
        **DB_CONFIG
    )
except mysql.connector.Error:
    connection_pool = None

def create_database_if_not_exists():
    """Create the target database if it does not already exist."""
    config = DB_CONFIG.copy()
    db_name = config.pop('database', 'car_rental_db')  # Remove database key for initial connection

    try:
        db = mysql.connector.connect(**config)
        cursor = db.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`;")
        cursor.close()
        db.close()
    except mysql.connector.Error:
        # Let caller handle connection/setup issues
        pass

def connect_db():
    """Get connection from pool or create new connection"""
    try:
        if connection_pool:
            return connection_pool.get_connection()
        else:
            return mysql.connector.connect(**DB_CONFIG)
    except mysql.connector.Error:
        # Fallback to direct connection
        return mysql.connector.connect(**DB_CONFIG)

def get_db_connection():
    """Alias for connect_db for consistency"""
    return connect_db()
