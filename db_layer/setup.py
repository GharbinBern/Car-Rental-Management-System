'''
Simple database setup module for the car rental system.

This module provides functions to create tables and populate them with sample data.
'''

import logging
from pathlib import Path
from contextlib import contextmanager

from .connection import connect_db

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class DatabaseSetupError(Exception):
    """Custom exception for database setup operations."""
    pass


@contextmanager
def get_db_connection():
    """Context manager for database connections with automatic cleanup."""
    db = None
    cursor = None
    try:
        db = connect_db()
        cursor = db.cursor()
        yield db, cursor
    except Exception as e:
        if db:
            db.rollback()
        raise DatabaseSetupError(f"Database error: {e}")
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


def _execute_sql_script(cursor, sql_script, script_name="SQL script"):
    """
    Execute a SQL script with support for DELIMITER statements.
    Enhanced with better error handling and cursor state management.
    """
    delimiter = ";"
    buffer = []
    statement_count = 0

    def _flush_buffer():
        nonlocal statement_count
        if not buffer:
            return
            
        stmt = "\n".join(buffer).strip()
        if delimiter != ";" and stmt.endswith(delimiter):
            stmt = stmt[: -len(delimiter)].strip()
        
        if stmt:
            try:
                cursor.execute(stmt)
                # Consume any results to avoid "Commands out of sync" error
                try:
                    cursor.fetchall()
                except:
                    pass  # No results to fetch, which is fine
                statement_count += 1
            except Exception as e:
                logger.error(f"Error in {script_name}: {stmt[:100]}...")
                raise DatabaseSetupError(f"SQL execution failed: {e}")
        buffer.clear()

    # Split script into lines and process
    lines = sql_script.splitlines()
    for i, raw_line in enumerate(lines):
        line = raw_line.rstrip()
        stripped = line.strip()
        
        # Skip empty lines and comments
        if not stripped or stripped.startswith('--') or stripped.startswith('/*'):
            if not stripped.startswith(('--', '/*')):
                buffer.append(line)
            continue

        if stripped.upper().startswith("DELIMITER "):
            _flush_buffer()
            parts = stripped.split(None, 1)
            delimiter = parts[1] if len(parts) == 2 else ";"
            continue

        buffer.append(line)

        # Check if statement is complete
        joined = "\n".join(buffer).strip()
        if delimiter == ";" and joined.endswith(";"):
            _flush_buffer()
        elif delimiter != ";" and joined.endswith(delimiter):
            _flush_buffer()

    # Execute any remaining statement
    _flush_buffer()
    logger.info(f"Executed {statement_count} statements from {script_name}")


def _read_sql_file(filename, sql_dir="sql"):
    """Read SQL file with error handling."""
    file_path = Path(sql_dir) / filename
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        raise DatabaseSetupError(f"SQL file not found: {file_path}")
    except Exception as e:
        raise DatabaseSetupError(f"Error reading {file_path}: {e}")


def create_tables_from_sql_file(schema_file="schema.sql"):
    """Create database tables from schema file."""
    logger.info("Creating tables...")
    
    try:
        with get_db_connection() as (db, cursor):
            sql_queries = _read_sql_file(schema_file)
            _execute_sql_script(cursor, sql_queries, schema_file)
            db.commit()
            logger.info("✓ Tables created successfully!")
            return True
    except Exception as e:
        logger.error(f"✗ Failed to create tables: {e}")
        return False


def populate_data(data_file="insert_data.sql", reset_data=True):
    """Populate database with sample data."""
    logger.info("Populating data...")
    
    try:
        with get_db_connection() as (db, cursor):
            
            # Reset existing data if requested
            if reset_data:
                _reset_tables(cursor, db)
            
            # Insert new data
            sql_queries = _read_sql_file(data_file)
            _execute_sql_script(cursor, sql_queries, data_file)
            db.commit()
            
            # Show summary
            _show_data_summary(cursor)
            logger.info("✓ Sample data inserted successfully!")
            return True
            
    except Exception as e:
        logger.error(f"✗ Failed to populate data: {e}")
        return False


def _reset_tables(cursor, db):
    """Reset all tables by truncating in correct order."""
    tables = [
        "ReviewRatings", "RentalPromo", "PromoOffer", "LoyaltyProgram",
        "VehicleMaintenance", "Payment", "Rental", "Staff", 
        "Customer", "Vehicle", "Branch"
    ]
    
    try:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        for table in tables:
            try:
                cursor.execute(f"TRUNCATE TABLE {table};")
            except:
                pass  # Table might not exist yet
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
        db.commit()
        logger.info("Existing data cleared")
    except Exception as e:
        logger.warning(f"Could not reset tables: {e}")
        db.rollback()


def create_views(views_file="views.sql"):
    """Create database views."""
    logger.info("Creating views...")
    
    # Check if views file exists
    if not (Path("sql") / views_file).exists():
        logger.info("Views file not found, skipping...")
        return True
    
    try:
        with get_db_connection() as (db, cursor):
            sql_script = _read_sql_file(views_file)
            _execute_sql_script(cursor, sql_script, views_file)
            db.commit()
            logger.info("✓ Views created successfully!")
            return True
    except Exception as e:
        logger.error(f"✗ Failed to create views: {e}")
        return False


def _show_data_summary(cursor):
    """Show summary of inserted data."""
    tables = ["Branch", "Vehicle", "Customer", "Staff", "Rental", "Payment"]
    
    logger.info("Data summary:")
    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            logger.info(f"  {table}: {count} records")
        except:
            pass