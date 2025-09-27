''' 
Entry point for the application. Sets up the database and starts the CLI. 
'''

from db_layer.connection import create_database_if_not_exists
from db_layer.setup import create_tables_from_sql_file, populate_data, create_views
from cli.main_cli import main

if __name__ == "__main__":
    create_database_if_not_exists()
    create_tables_from_sql_file()
    populate_data()
    create_views()
    main()
