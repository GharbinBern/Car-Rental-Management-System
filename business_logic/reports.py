'''
Report-related business logic for the car rental management system.
'''

from db_layer.connection import connect_db

def view_branch_stats():
    db = connect_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM branch_view;")
    print("\n--- Branch Statistics ---")
    # Header with fixed column widths
    print(f"{'Branch Code':<12} | {'Branch Name':<30} | {'Vehicles':>8} | {'Rentals':>8} | {'Income':>12}")
    print("-" * 82)
    for row in cursor.fetchall():
        branch_code, branch_name, total_vehicles, total_rentals, total_income = row
        print(f"{branch_code:<12} | {branch_name:<30} | {total_vehicles:8d} | {total_rentals:8d} | €{total_income:10.2f}")
    cursor.close()
    db.close()

def view_customer_history():
    db = connect_db()
    cursor = db.cursor()
    customer_code = input("Customer Code: ")

    cursor.execute("""
        SELECT CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
               v.brand, v.model, r.pickup_datetime, r.return_datetime, r.actual_return_datetime,
               r.total_cost, r.status, rr.rating_score, rr.review_text
        FROM Rental r
        JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
        LEFT JOIN ReviewRatings rr ON r.rental_id = rr.rental_id
        JOIN Customer c ON r.customer_id = c.customer_id
        WHERE c.customer_code=%s
        ORDER BY r.pickup_datetime DESC;
    """, (customer_code,))
    
    rows = cursor.fetchall()
    if not rows:
        print("No rental history found for that customer.")
    else:
        # Use the first row to get the customer's full name
        customer_name = rows[0][0]
        print(f"\n--- Rental History for Customer {customer_code} - {customer_name} ---")
        # Header with fixed column widths
        print(f"{'Vehicle':<30} | {'Pickup':<19} | {'Scheduled Return':<19} | {'Actual Return':<19} | {'Cost':>9} | {'Status':<12} | {'Rating':^6} | {'Review':<40}")
        print("-" * 150)
        for row in rows:
            # unpack according to SELECT order
            customer_name, brand, model, pickup, scheduled_return, actual_return, cost, status, rating, review = row
            vehicle = f"{brand} {model}"
            pickup_s = pickup.strftime('%Y-%m-%d %H:%M') if hasattr(pickup, 'strftime') else str(pickup)
            scheduled_s = scheduled_return.strftime('%Y-%m-%d %H:%M') if hasattr(scheduled_return, 'strftime') else str(scheduled_return)
            actual_s = actual_return.strftime('%Y-%m-%d %H:%M') if (actual_return and hasattr(actual_return, 'strftime')) else (actual_return or 'N/A')
            rating_display = f"{rating:.1f}" if isinstance(rating, (int, float)) else (rating or 'N/A')
            review_display = review if review else 'No review'
            print(f"{vehicle:<30} | {pickup_s:<19} | {scheduled_s:<19} | {actual_s:<19} | €{cost:8.2f} | {status:<12} | {rating_display:^6} | {review_display:<40}")
    
    cursor.close()
    db.close()
