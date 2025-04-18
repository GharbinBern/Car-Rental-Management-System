import mysql.connector
from datetime import datetime
from decimal import Decimal

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
        user="root",
        password="Sevenbern101",
        database="car_rental_db"
    )

def create_tables_from_sql_file():
    db = connect_db()
    cursor = db.cursor()
    try:
        cursor.execute("USE car_rental_db;")

        with open("/Users/gharbinbern/Desktop/create_tables.sql", "r") as file:
            sql_queries = file.read()

        for query in sql_queries.split(";"):
            query = query.strip()
            if query:
                cursor.execute(query)

        db.commit()
        print("✅ Tables created successfully from the SQL file!")

    except mysql.connector.Error as err:
        print(f"❌ Error: {err}")
        db.rollback()

    finally:
        cursor.close()
        db.close()

def populate_data():
    db = connect_db()
    cursor = db.cursor()
    try:
        cursor.execute("USE car_rental_db;")

        with open("/Users/gharbinbern/Desktop/insert_data.sql", "r") as file:
            sql_queries = file.read()

        for query in sql_queries.split(";"):
            query = query.strip()
            if query:
                cursor.execute(query)

        db.commit()
        print("✅ Sample data inserted successfully!")

    except mysql.connector.Error as err:
        print(f"❌ Error: {err}")
        db.rollback()
    finally:
        cursor.close()
        db.close()

def create_views():
    db = connect_db()
    cursor = db.cursor()
    try:
        with open("/Users/gharbinbern/Desktop/views.sql", "r") as file:
            sql_script = file.read()

        for statement in sql_script.strip().split(";"):
            if statement.strip():
                cursor.execute(statement)

        db.commit()
        print("✅ Views created successfully!")
    except mysql.connector.Error as err:
        print(f"❌ Error creating views: {err}")
    finally:
        cursor.close()
        db.close()

def list_available_vehicles():
    db = connect_db()
    cursor = db.cursor()
    cursor.execute("SELECT vehicle_id, brand, model, daily_rate FROM Vehicle WHERE status = 'Available';")
    results = cursor.fetchall()
    print("\nAvailable Vehicles:")
    for row in results:
        print(f"ID: {row[0]} | {row[1]} {row[2]} | €{row[3]}/day")
    cursor.close()
    db.close()

from datetime import datetime

def register_customer():
    db = connect_db()
    cursor = db.cursor()
    print("\n--- Register New Customer ---")
    customer_id = input("Customer ID: ")
    first = input("First Name: ")
    last = input("Last Name: ")
    email = input("Email: ")
    phone = input("Phone: ")
    license_num = input("License Number: ")
    
    # Validate Date of Birth format
    while True:
        dob = input("Date of Birth (YYYY-MM-DD): ")
        try:
            # Check if the date is in the correct format
            valid_dob = datetime.strptime(dob, "%Y-%m-%d")
            break  # If the date is valid, break out of the loop
        except ValueError:
            print("Invalid date format. Please enter the date in YYYY-MM-DD format.")
    
    country = input("Country: ")

    # Insert into database
    query = """
        INSERT INTO Customer (customer_id, first_name, last_name, email, phone, license_number, date_of_birth, country_of_residence)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
    """
    values = (customer_id, first, last, email, phone, license_num, valid_dob, country)
    cursor.execute(query, values)
    db.commit()
    print("✅ Customer registered successfully.")
    cursor.close()
    db.close()


def rent_vehicle():
    db = connect_db()
    cursor = db.cursor()
    print("\n--- Rent Vehicle ---")
    rental_id = input("Rental ID: ")
    vehicle_id = input("Vehicle ID: ")
    customer_id = input("Customer ID: ")
    staff_id = input("Staff ID: ")
    pickup_branch = input("Pickup Branch ID: ")
    return_branch = input("Return Branch ID: ")
    pickup = input("Pickup DateTime (YYYY-MM-DD HH:MM:SS): ")
    return_time = input("Scheduled Return DateTime (YYYY-MM-DD HH:MM:SS): ")
    cost = float(input("Total Cost: "))
    query = """
        INSERT INTO Rental (rental_id, vehicle_id, customer_id, staff_id, pickup_branch_id, return_branch_id, pickup_datetime, return_datetime, total_cost)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    cursor.execute(query, (rental_id, vehicle_id, customer_id, staff_id, pickup_branch, return_branch, pickup, return_time, cost))
    cursor.execute("UPDATE Vehicle SET status = 'Rented' WHERE vehicle_id = %s;", (vehicle_id,))
    db.commit()
    print("🚗 Vehicle rented successfully!")
    cursor.close()
    db.close()

def return_vehicle():
    db = connect_db()
    cursor = db.cursor()
    print("\n--- Return Vehicle ---")
    rental_id = input("Rental ID: ")
    actual_return = input("Actual Return DateTime (YYYY-MM-DD HH:MM:SS): ")
    cursor.execute("""
        UPDATE Rental
        SET actual_return_datetime = %s, status = 'Returned'
        WHERE rental_id = %s;
    """, (actual_return, rental_id))
    cursor.execute("""
        UPDATE Vehicle
        SET status = 'Available'
        WHERE vehicle_id = (SELECT vehicle_id FROM Rental WHERE rental_id = %s);
    """, (rental_id,))
    db.commit()
    print("✅ Vehicle returned and status updated.")
    cursor.close()
    db.close()

def view_branch_stats():
    db = connect_db()
    cursor = db.cursor()
    print("\n--- View Branch Statistics ---")
    cursor.execute("SELECT * FROM branch_view;")
    for row in cursor.fetchall():
        print(row)
    cursor.close()
    db.close()

def apply_promo():
    db = connect_db()
    cursor = db.cursor()
    print("\n--- Apply Promo to Rental ---")
    rental_id = input("Rental ID: ")
    promo_id = input("Promo ID: ")
    cursor.execute("""
        INSERT INTO RentalPromo (rental_id, promo_id)
        VALUES (%s, %s);
    """, (rental_id, promo_id))
    db.commit()
    print("🎉 Promo applied successfully.")
    cursor.close()
    db.close()


def view_customer_history():
    db = connect_db()
    cursor = db.cursor()
    print("\n--- View Customer Rental History ---")
    customer_id = input("Customer ID: ")
    try:
        cursor.execute("""
            SELECT v.brand, v.model, r.pickup_datetime, r.total_cost, rr.rating_score, rr.review_text
            FROM Rental r
            JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
            LEFT JOIN ReviewRatings rr ON r.rental_id = rr.rental_id
            WHERE r.customer_id = %s;
        """, (customer_id,))
        rows = cursor.fetchall()
        if not rows:
            print("No history found for that customer.")
        else:
            for row in rows:
                brand, model, pickup_dt, cost, rating, review = row
                pickup_str = pickup_dt.strftime("%Y-%m-%d %H:%M") if isinstance(pickup_dt, datetime) else str(pickup_dt)
                cost_str = f"${float(cost):.2f}" if isinstance(cost, Decimal) else str(cost)
                rating_str = f"{float(rating):.1f}" if rating else "N/A"
                review_str = review or "No review"

                print(f"🚗 {brand} {model}")
                print(f"📅 Pickup: {pickup_str}")
                print(f"💰 Cost: {cost_str}")
                print(f"⭐ Rating: {rating_str}")
                print(f"📝 Review: {review_str}")
    except mysql.connector.Error as err:
        print(f"❌ Error: {err}")
    finally:
        cursor.close()
        db.close()

def main():
    while True:
        print("\n=== Car Rental CLI ===")
        print("1. List Available Vehicles")
        print("2. Register New Customer")
        print("3. Rent a Vehicle")
        print("4. Return a Vehicle")
        print("5. View Branch Stats")
        print("6. Apply Promo")
        print("7. View Customer History")
        print("8. Exit")

        choice = input("Select an option: ")

        if choice == "1":
            list_available_vehicles()
        elif choice == "2":
            register_customer()
        elif choice == "3":
            rent_vehicle()
        elif choice == "4":
            return_vehicle()
        elif choice == "5":
            view_branch_stats()
        elif choice == "6":
            apply_promo()
        elif choice == "7":
            view_customer_history()
        elif choice == "8":
            print("Exiting... 👋")
            break
        else:
            print("Invalid option. Try again.")

if __name__ == "__main__":
    create_database_if_not_exists()   
    create_tables_from_sql_file()     
    populate_data()
    create_views()
    main()                            
