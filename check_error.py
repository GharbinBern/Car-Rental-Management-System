from db_layer.connection import connect_db

db = connect_db()
cursor = db.cursor()

# Check Rental table
cursor.execute("DESCRIBE Vehicle;")
print("Rental table structure:")
for row in cursor.fetchall():
    print(row)

cursor.execute("SELECT * FROM Vehicle;")
print("\nCurrent Rental data:")
for row in cursor.fetchall():
    print(row)

cursor.close()
db.close()


# SELECT rental_id FROM Rental WHERE rental_id IN (1,3,4,8,9,11);
# SELECT promo_id FROM PromoOffer WHERE promo_id IN (1,2,3,5,6);
