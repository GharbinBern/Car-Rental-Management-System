'''
Vehicle-related business logic for the car rental management system.
'''

from db_layer.connection import connect_db

def list_available_vehicles():
    db = connect_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT vehicle_code, brand, model, type, daily_rate, seating_capacity, has_air_conditioning
        FROM Vehicle 
        WHERE status='Available';
    """)
    print("\n--- Available Vehicles ---")
    # Header with fixed column widths
    print(f"{'Code':<12} | {'Vehicle':<30} | {'Type':<12} | {'Seats':<5} | {'AC':<3} | {'Rate':>10}")
    print("-" * 90)
    for row in cursor.fetchall():
        code, brand, model, v_type, rate, seats, ac = row
        ac_status = "Yes" if ac else "No"
        name = f"{brand} {model}"
        print(f"{code:<12} | {name:<30} | {v_type:<12} | {seats:^5} | {ac_status:^3} | €{rate:8.2f}/day")
    cursor.close()
    db.close()

def update_vehicle_status(vehicle_code, new_status):
    db = connect_db()
    cursor = db.cursor()
    cursor.execute("UPDATE Vehicle SET status=%s WHERE vehicle_code=%s;", (new_status, vehicle_code))
    db.commit()
    print(f"Vehicle {vehicle_code} status updated to '{new_status}'.")
    cursor.close()
    db.close()

def get_vehicle_by_code(vehicle_code):
    """Fetch full vehicle info by its code."""
    db = connect_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT vehicle_id, vehicle_code, brand, model, type, fuel_type, transmission, plate_number,
               status, branch_id, daily_rate, seating_capacity, large_luggage_capacity,
               small_luggage_capacity, door_count, has_air_conditioning
        FROM Vehicle
        WHERE vehicle_code=%s;
    """, (vehicle_code,))
    vehicle = cursor.fetchone()
    cursor.close()
    db.close()
    return vehicle

def list_all_vehicles():
    """List all vehicles in the system with status."""
    db = connect_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT vehicle_code, brand, model, status, daily_rate, branch_id
        FROM Vehicle;
    """)
    print("\n--- All Vehicles ---")
    # Header with fixed column widths
    print(f"{'Code':<12} | {'Vehicle':<30} | {'Status':<12} | {'Rate':>13} | {'Branch':<6}")
    print("-" * 84)
    for row in cursor.fetchall():
        code, brand, model, status, rate, branch_id = row
        name = f"{brand} {model}"
        print(f"{code:<12} | {name:<30} | {status:<12} | €{rate:8.2f}/day | {branch_id:<6}")
    cursor.close()
    db.close()
