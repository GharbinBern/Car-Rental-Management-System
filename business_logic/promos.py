'''
Promo-related business logic for the car rental management system.
'''

from db_layer.connection import connect_db

# def apply_promo():
#     db = connect_db()
#     cursor = db.cursor()

#     print("\n--- Apply Promo to Rental ---")
#     rental_id = int(input("Rental ID: "))
#     promo_id = int(input("Promo ID: "))

#     # Check if promo already applied
#     cursor.execute("SELECT * FROM RentalPromo WHERE rental_id=%s AND promo_id=%s;", (rental_id, promo_id))
#     if cursor.fetchone():
#         print("This promo has already been applied to this rental.")
#     else:
#         cursor.execute("INSERT INTO RentalPromo (rental_id, promo_id) VALUES (%s, %s);", (rental_id, promo_id))
#         db.commit()
#         print("Promo applied successfully.")

#     cursor.close()
#     db.close()
