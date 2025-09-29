''' 
Entry point for the Car Rental Management System CLI application.
Sets up the database and starts the CLI interface.
'''

import sys
import argparse
from db_layer.connection import create_database_if_not_exists
from db_layer.setup import init_database
from cli.main_cli import main as cli_main

def setup_database():
    """Initialize the database with tables and sample data."""
    print("Setting up database...")
    try:
        # Create database if it doesn't exist
        create_database_if_not_exists()
        print("Database created/verified")
        
        # Initialize tables, views, and sample data
        init_database()
        print("Database initialization completed")
        
    except Exception as e:
        print(f"Database setup failed: {e}")
        sys.exit(1)

def run_cli():
    """Start the CLI interface."""
    print("\nStarting Car Rental Management System CLI...")
    try:
        cli_main()
    except KeyboardInterrupt:
        print("\n\nGoodbye!")
    except Exception as e:
        print(f"CLI error: {e}")
        sys.exit(1)

def main():
    """Main entry point with command line argument parsing."""
    parser = argparse.ArgumentParser(
        description="Car Rental Management System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run.py                    # Setup database and start CLI
  python run.py --setup-only       # Only setup database
  python run.py --cli-only         # Only start CLI (assumes DB is ready)
  python run.py --skip-setup       # Skip database setup and start CLI
        """
    )
    
    parser.add_argument(
        '--setup-only', 
        action='store_true',
        help='Only setup the database, do not start CLI'
    )
    
    parser.add_argument(
        '--cli-only', 
        action='store_true',
        help='Only start CLI, skip database setup'
    )
    
    parser.add_argument(
        '--skip-setup', 
        action='store_true',
        help='Skip database setup and start CLI directly'
    )
    
    args = parser.parse_args()
    
    # Handle different modes
    if args.setup_only:
        setup_database()
        print("Database setup completed. Run 'python run.py --cli-only' to start the CLI.")
        
    elif args.cli_only or args.skip_setup:
        run_cli()
        
    else:
        # Default behavior: setup database then start CLI
        setup_database()
        run_cli()

if __name__ == "__main__":
    main()
