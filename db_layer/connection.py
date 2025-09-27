'''
handles the database connection and creation
'''

import mysql.connector

def create_database_if_not_exists():
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Sevenbern101"
    )
    cursor = db.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS car_rental_db;")
    cursor.close()
    db.close()

def connect_db():
    return mysql.connector.connect(
        host="localhost",
        allow_local_infile=True,
        user="root",
        password="Sevenbern101",
        database="car_rental_db"
    )
