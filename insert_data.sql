
-- Populate Branch table with data
INSERT INTO Branch (branch_id, name, address, city, country, phone) 
VALUES 
('1', 'Branch A', '123 Main St', 'CityA', 'CountryA', '1234567890'),
('2', 'Branch B', '456 Oak St', 'CityB', 'CountryB', '0987654321'),
('3', 'Branch C', '789 Pine St', 'CityC', 'CountryC', '1122334455'),
('4', 'Branch D', '101 Maple St', 'CityD', 'CountryD', '5566778899');

-- Populate Vehicle table with data
INSERT INTO Vehicle (vehicle_id, brand, model, type, fuel_type, transmission, plate_number, status, branch_id, daily_rate, seating_capacity, large_luggage_capacity, small_luggage_capacity, door_count, has_air_conditioning) 
VALUES 
('90', 'Toyota', 'Camry', 'Sedan', 'Gasoline', 'Automatic', 'ABC123', 'Available', '1', 50.00, 5, 2, 2, 4, TRUE),
('91', 'Honda', 'Civic', 'Sedan', 'Gasoline', 'Manual', 'XYZ456', 'Available', '2', 40.00, 5, 1, 2, 4, TRUE),
('92', 'Ford', 'Focus', 'Hatchback', 'Diesel', 'Automatic', 'LMN789', 'Available', '3', 45.00, 5, 1, 1, 5, TRUE);

-- Populate Customer table with data
INSERT INTO Customer (customer_id, first_name, last_name, email, phone, date_of_birth, license_number, country_of_residence, is_loyalty_member, loyalty_tier) 
VALUES 
('3', 'John', 'Doe', 'johndoe@gmail.com', '1234567890', '1990-01-01', 'ABC123456', 'USA', TRUE, 'Gold'),
('2', 'Jane', 'Smith', 'janesmith@yahoo.com', '9876543210', '1985-05-15', 'XYZ987654', 'UK', FALSE, NULL);

-- Populate Staff table with data
INSERT INTO Staff (staff_id, first_name, last_name, email, position, branch_id, hire_date) 
VALUES 
('1', 'Alice', 'Johnson', 'alice@brancha.com', 'Manager', '1', '2015-04-01'),
('2', 'Bob', 'Williams', 'bob@branchb.com', 'Assistant', '2', '2018-07-01');

-- Populate Rental table with data
INSERT INTO Rental (rental_id, vehicle_id, customer_id, staff_id, pickup_branch_id, return_branch_id, pickup_datetime, return_datetime, actual_return_datetime, late_duration, duration_unit, status, booked_via, total_cost, is_one_way, driver_age, deposit_paid_online, payment_due_at_pickup)
VALUES 
('90', '90', '1', '1', '1', '2', '2023-04-01 10:00:00', '2023-04-03 10:00:00', NULL, NULL, 'days', 'Booked', 'Website', 150.00, FALSE, 30, 20.00, 130.00);

-- Populate Payment table with data
INSERT INTO Payment (payment_id, rental_id, amount, payment_date, payment_method, is_successful)
VALUES 
('1', '90', 130.00, '2023-04-01', 'Credit Card', TRUE);

-- Populate VehicleMaintenance table with data
INSERT INTO VehicleMaintenance (maintenance_id, vehicle_id, description, maintenance_date, cost, performed_by)
VALUES 
('1', '90', 'Oil change and tire check', '2023-03-01', 50.00, 'John Mechanic');

-- Populate LoyaltyProgram table with data
INSERT INTO LoyaltyProgram (program_id, customer_id, points_balance, membership_tier, date_joined)
VALUES 
('1', '1', 1200, 'Gold', '2020-01-01');

-- Populate PromoOffer table with data
INSERT INTO PromoOffer (promo_id, name, discount_percent, valid_from, valid_to, conditions)
VALUES 
('1', 'Summer Sale', 10, '2023-06-01', '2023-06-30', 'Valid for all rentals above $100');

-- Populate RentalPromo table with data
INSERT INTO RentalPromo (rental_id, promo_id)
VALUES 
('90', '1');

-- Populate ReviewRatings table with data
INSERT INTO ReviewRatings (review_id, rental_id, rating_score, review_text, review_date)
VALUES 
('1', '90', 4.5, 'Great experience with the car, smooth rental process.', '2023-04-05');