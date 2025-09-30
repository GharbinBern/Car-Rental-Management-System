from ...database.connection import connect_db
from datetime import datetime

def rent_vehicle():
    db = connect_db()
    cursor = db.cursor()

    print("\n--- Rent a Vehicle ---")
    vehicle_code = input("Vehicle Code: ")
    customer_code = input("Customer Code: ")
    staff_code = input("Staff Code: ")
    pickup_branch_code = input("Pickup Branch Code: ")
    return_branch_code = input("Return Branch Code: ")
    pickup = input("Pickup DateTime (YYYY-MM-DD HH:MM:SS): ")
    return_time = input("Scheduled Return DateTime (YYYY-MM-DD HH:MM:SS): ")
    cost = float(input("Total Cost: "))
    is_one_way = input("Is One-Way Rental? (yes/no): ").lower() == "yes"
    driver_age = int(input("Driver Age: "))
    deposit_paid = float(input("Deposit Paid Online: "))
    payment_due = float(input("Payment Due at Pickup: "))

    # Check vehicle availability
    cursor.execute("SELECT status FROM Vehicle WHERE vehicle_code=%s;", (vehicle_code,))
    status = cursor.fetchone()
    if not status or status[0] != 'Available':
        print("Vehicle is not available for rental.")
        cursor.close()
        db.close()
        return

    query = """
        INSERT INTO Rental (
            vehicle_id, customer_id, staff_id, pickup_branch_id, return_branch_id,
            pickup_datetime, return_datetime, total_cost, is_one_way, driver_age,
            deposit_paid_online, payment_due_at_pickup, status, booked_via
        )
        SELECT v.vehicle_id, c.customer_id, s.staff_id, pb.branch_id, rb.branch_id,
               %s, %s, %s, %s, %s, %s, %s, 'Booked', 'CLI'
        FROM Vehicle v, Customer c, Staff s, Branch pb, Branch rb
        WHERE v.vehicle_code=%s AND c.customer_code=%s AND s.staff_code=%s AND pb.branch_code=%s AND rb.branch_code=%s;
    """
    cursor.execute(query, (pickup, return_time, cost, is_one_way, driver_age, deposit_paid, payment_due,
                           vehicle_code, customer_code, staff_code, pickup_branch_code, return_branch_code))

    cursor.execute("UPDATE Vehicle SET status='Rented' WHERE vehicle_code=%s;", (vehicle_code,))
    db.commit()
    print("Vehicle rented successfully!")
    cursor.close()
    db.close()

def return_vehicle():
    db = connect_db()
    cursor = db.cursor()

    print("\n--- Return a Vehicle ---")
    rental_id = int(input("Rental ID: "))
    actual_return = input("Actual Return DateTime (YYYY-MM-DD HH:MM:SS): ")

    # Update Rental with actual return datetime (trigger will calculate late_duration)
    cursor.execute("UPDATE Rental SET actual_return_datetime=%s, status='Returned' WHERE rental_id=%s;",
                   (actual_return, rental_id))

    # Update Vehicle status to Available
    cursor.execute("""
        UPDATE Vehicle v
        JOIN Rental r ON v.vehicle_id = r.vehicle_id
        SET v.status='Available'
        WHERE r.rental_id=%s;
    """, (rental_id,))

    db.commit()
    print("Vehicle returned successfully.")
    cursor.close()
    db.close()
