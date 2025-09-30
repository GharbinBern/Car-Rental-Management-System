'''
Database setup module for the car rental system.

This module handles the complete database initialization process including:
- Creating all required tables (schema.sql)
- Setting up views for reporting (views.sql)
- Creating authentication tables (auth.sql)
- Populating initial data if needed
'''

import logging
from pathlib import Path
from contextlib import contextmanager
from typing import List, Optional

from .connection import connect_db

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# Define the order of SQL script execution
SETUP_SCRIPTS = [
    'schema.sql',    # Base tables must be created first
    'auth.sql',      # Authentication tables
    'views.sql',     # Views depend on base tables
    'insert_data.sql' # Sample data last
]

 


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


def read_sql_file(file_path: Path) -> str:
    """Read and return the contents of a SQL file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            # Replace any Windows line endings with Unix ones
            content = f.read().replace('\r\n', '\n')
            # Ensure the file ends with a semicolon
            if content.strip() and not content.strip().endswith(';'):
                content = content.rstrip() + ';'
            return content
    except Exception as e:
        raise DatabaseSetupError(f"Error reading SQL file {file_path}: {e}")


def split_sql_statements(sql_script: str) -> List[str]:
    """
    Split a SQL script into individual statements, respecting delimiters.
    Handles both standard semicolon delimiters and custom delimiters.
    """
    statements = []
    current_statement = []
    current_delimiter = ';'
    
    for line in sql_script.split('\n'):
        line = line.strip()
        
        # Skip comments and empty lines
        if not line or line.startswith('--'):
            continue
            
        # Check for DELIMITER changes
        if line.upper().startswith('DELIMITER'):
            if current_statement:
                stmt = ' '.join(current_statement).strip()
                if stmt:
                    statements.append(stmt)
            current_statement = []
            current_delimiter = line.split()[1]
            continue
            
        # Add line to current statement
        current_statement.append(line)
        
        # Check if statement is complete
        if line.endswith(current_delimiter):
            stmt = ' '.join(current_statement)
            # Remove the delimiter
            stmt = stmt[:-len(current_delimiter)].strip()
            if stmt:
                statements.append(stmt)
            current_statement = []
            
    # Handle any remaining statement
    if current_statement:
        stmt = ' '.join(current_statement).strip()
        if stmt:
            statements.append(stmt)
            
    return statements


def execute_sql_script(cursor, sql_script: str, script_name: str = "SQL script") -> int:
    """
    Execute a SQL script with support for DELIMITER statements.
    Returns the number of statements executed.
    """
    statements = split_sql_statements(sql_script)
    statement_count = 0
    
    for stmt in statements:
        try:
            logger.debug(f"Executing statement:\n{stmt}")
            cursor.execute(stmt)
            statement_count += 1
        except Exception as e:
            error_msg = f"Error executing statement in {script_name}: {str(e)}"
            logger.error(f"{error_msg}\nFailed statement:\n{stmt}")
            raise DatabaseSetupError(error_msg)
            
    return statement_count


def init_database(sql_dir: Optional[str] = None, scripts: Optional[List[str]] = None) -> None:
    """
    Initialize the database by executing SQL scripts in the correct order.
    
    Args:
        sql_dir: Directory containing SQL scripts. Defaults to ../sql relative to this file.
        scripts: List of script names to execute. Defaults to SETUP_SCRIPTS.
    """
    if sql_dir is None:
        sql_dir = Path(__file__).parent.parent / 'sql'
    else:
        sql_dir = Path(sql_dir)

    if not sql_dir.exists():
        raise DatabaseSetupError(f"SQL directory not found: {sql_dir}")

    if scripts is None:
        scripts = SETUP_SCRIPTS

    logger.info(f"Initializing database using scripts from {sql_dir}")

    with get_db_connection() as (db, cursor):
        for script_name in scripts:
            script_path = sql_dir / script_name
            if not script_path.exists():
                logger.warning(f"Script not found, skipping: {script_path}")
                continue

            try:
                logger.info(f"Executing {script_name}...")
                sql_content = read_sql_file(script_path)
                stmt_count = execute_sql_script(cursor, sql_content, script_name)
                db.commit()
                logger.info(f"Successfully executed {stmt_count} statements from {script_name}")

            except Exception as e:
                logger.error(f"Error executing {script_name}: {e}")
                raise DatabaseSetupError(f"Failed to execute {script_name}: {e}")

    logger.info("Database initialization completed successfully")


def main():
    """
    Command-line interface for database setup.
    
    Usage:
        python -m database.setup [--sql-dir=<path>] [--scripts=<script1,script2,...>]
    """
    import argparse

    parser = argparse.ArgumentParser(description='Initialize the Car Rental System database.')
    parser.add_argument('--sql-dir', help='Directory containing SQL scripts')
    parser.add_argument('--scripts', help='Comma-separated list of scripts to execute')

    args = parser.parse_args()

    try:
        scripts = args.scripts.split(',') if args.scripts else None
        init_database(sql_dir=args.sql_dir, scripts=scripts)
    except DatabaseSetupError as e:
        logger.error(f"Setup failed: {e}")
        exit(1)
    except KeyboardInterrupt:
        logger.info("\nSetup interrupted by user")
        exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        exit(1)


if __name__ == '__main__':
    main()