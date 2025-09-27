'''
Customer-related business logic for the car rental management system.
'''

from db_layer.connection import connect_db
from datetime import datetime

def register_customer():
    db = connect_db()
    cursor = db.cursor()
    print("\n--- Register New Customer ---")
    customer_code = input("Customer Code: ")
    first = input("First Name: ")
    last = input("Last Name: ")
    email = input("Email: ")
    phone = input("Phone: ")
    license_num = input("License Number: ")

    # Validate date of birth
    while True:
        dob = input("Date of Birth (YYYY-MM-DD): ")
        try:
            valid_dob = datetime.strptime(dob, "%Y-%m-%d").date()
            break
        except ValueError:
            print("Invalid date format. Please enter the date in YYYY-MM-DD format.")

    country = input("Country of Residence: ")

    # Optional: Loyalty program
    loyalty_input = input("Is the customer a loyalty member? (y/n): ").strip().lower()
    is_loyalty_member = True if loyalty_input == 'y' else False
    loyalty_tier = None
    if is_loyalty_member:
        loyalty_tier = input("Loyalty Tier (e.g., Gold, Silver, Platinum): ").strip()

    query = """
        INSERT INTO Customer (
            customer_code, first_name, last_name, email, phone, license_number,
            date_of_birth, country_of_residence, is_loyalty_member
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    values = (customer_code, first, last, email, phone, license_num, valid_dob, country, is_loyalty_member)
    # Check for existing customer_code to avoid duplicate key errors
    cursor.execute("SELECT customer_id FROM Customer WHERE customer_code = %s", (customer_code,))
    if cursor.fetchone():
        print(f"Customer code '{customer_code}' already exists. Registration cancelled.")
        cursor.close()
        db.close()
        return

    # Perform the insert once
    cursor.execute(query, values)
    # Get the new customer's id
    new_customer_id = cursor.lastrowid
    db.commit()

    # If the customer is a loyalty member, create an entry in LoyaltyProgram
    if is_loyalty_member:
        from datetime import date
        date_joined = date.today()
        lp_query = """
            INSERT INTO LoyaltyProgram (customer_id, points_balance, membership_tier, date_joined)
            VALUES (%s, %s, %s, %s);
        """
        lp_values = (new_customer_id, 0, loyalty_tier, date_joined)
        cursor.execute(lp_query, lp_values)
        db.commit()
        print(f"Customer registered and added to Loyalty Program (tier: {loyalty_tier}).")
    else:
        print("Customer registered successfully.")
    cursor.close()
    db.close()

def list_customers():
    db = connect_db()
    cursor = db.cursor()
    # Include membership_tier from LoyaltyProgram if available
    cursor.execute("""
        SELECT c.customer_code, c.first_name, c.last_name, c.email, c.is_loyalty_member,
               lp.membership_tier
        FROM Customer c
        LEFT JOIN LoyaltyProgram lp ON c.customer_id = lp.customer_id;
    """)
    print("\n--- Customer List ---")
    # Header with fixed column widths
    print(f"{'Code':<12} | {'Name':<30} | {'Email':<30} | {'Loyalty':<7} | {'Tier':<10}")
    print("-" * 100)
    for row in cursor.fetchall():
        customer_code, first_name, last_name, email, is_loyalty_member, membership_tier = row
        name = f"{first_name} {last_name}"
        loyalty_str = 'Yes' if is_loyalty_member else 'No'
        tier_display = membership_tier if membership_tier else ''
        print(f"{customer_code:<12} | {name:<30} | {email:<30} | {loyalty_str:^7} | {tier_display:<10}")
    cursor.close()
    db.close()
