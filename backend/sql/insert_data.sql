-- =====================================
-- Car Rental System Sample Data
-- =====================================

-- Disable foreign key checks during data insertion
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================
-- Branch Sample Data
-- =====================================
INSERT INTO Branch (branch_code, name, address, city, country, phone) VALUES
('NYC001', 'Manhattan Downtown', '123 Broadway Ave', 'New York', 'USA', '+1-212-555-0101'),
('LAX002', 'Los Angeles Airport', '1 World Way', 'Los Angeles', 'USA', '+1-310-555-0102'),
('MIA003', 'Miami Beach', '500 Ocean Drive', 'Miami', 'USA', '+1-305-555-0103'),
('CHI004', 'Chicago Central', '100 N Michigan Ave', 'Chicago', 'USA', '+1-312-555-0104'),
('LAS005', 'Las Vegas Strip', '3850 Las Vegas Blvd', 'Las Vegas', 'USA', '+1-702-555-0105'),
('LON006', 'London Heathrow', 'Terminal 5, Heathrow Airport', 'London', 'UK', '+44-20-7946-0106'),
('PAR007', 'Paris Charles de Gaulle', 'Terminal 2E, CDG Airport', 'Paris', 'France', '+33-1-48-62-0107'),
('TOK008', 'Tokyo Shibuya', '2-21-1 Shibuya', 'Tokyo', 'Japan', '+81-3-3477-0108');

-- =====================================
-- Customer Sample Data
-- =====================================
INSERT INTO Customer (customer_code, first_name, last_name, email, phone, date_of_birth, license_number, country_of_residence, is_loyalty_member) VALUES
('CUST001', 'John', 'Smith', 'john.smith@email.com', '+1-555-0001', '1985-03-15', '', 'USA', FALSE),
('CUST002', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '+1-555-0002', '1990-07-22', 'DL23456789', 'USA', TRUE),
('CUST003', 'Michael', 'Brown', 'michael.brown@email.com', '+1-555-0003', '1982-11-08', 'DL34567890', 'USA', TRUE),
('CUST004', 'Emily', 'Davis', 'emily.davis@email.com', '+1-555-0004', '1995-01-30', 'DL45678901', 'USA', FALSE),
('CUST005', 'Robert', 'Wilson', 'robert.wilson@email.com', '+1-555-0005', '1978-09-12', 'DL56789012', 'USA', TRUE),
('CUST006', 'Jessica', 'Miller', 'jessica.miller@email.com', '+1-555-0006', '1988-04-18', 'DL67890123', 'USA', FALSE),
('CUST007', 'David', 'Garcia', 'david.garcia@email.com', '+1-555-0007', '1992-12-05', 'DL78901234', 'USA', TRUE),
('CUST008', 'Lisa', 'Martinez', 'lisa.martinez@email.com', '+1-555-0008', '1987-06-25', 'DL89012345', 'USA', FALSE),
('CUST009', 'James', 'Anderson', 'james.anderson@email.com', '+44-20-7946-0009', '1983-02-14', 'UK987654321', 'UK', TRUE),
('CUST010', 'Marie', 'Dubois', 'marie.dubois@email.com', '+33-1-48-62-0010', '1991-10-03', 'FR123456789', 'France', FALSE),
('CUST011', 'Hiroshi', 'Tanaka', 'hiroshi.tanaka@email.com', '+81-3-3477-0011', '1989-08-17', 'JP147258369', 'Japan', TRUE),
('CUST012', 'Amanda', 'Thompson', 'amanda.thompson@email.com', '+1-555-0012', '1994-05-11', 'DL90123456', 'USA', FALSE);

-- =====================================
-- Vehicle Sample Data
-- =====================================
INSERT INTO Vehicle (vehicle_code, brand, model, type, fuel_type, transmission, plate_number, status, branch_id, daily_rate, seating_capacity, large_luggage_capacity, small_luggage_capacity, door_count, has_air_conditioning) VALUES
-- NYC Branch Vehicles (branch_id = 1)
('NYC-ECO001', 'Toyota', 'Corolla', 'Economy', 'Gasoline', 'Automatic', 'NY123ABC', 'Available', 1, 45.99, 5, 1, 2, 4, TRUE),
('NYC-ECO002', 'Nissan', 'Sentra', 'Economy', 'Gasoline', 'Manual', 'NY456DEF', 'Available', 1, 42.99, 5, 1, 2, 4, TRUE),
('NYC-MID003', 'Honda', 'Accord', 'Midsize', 'Gasoline', 'Automatic', 'NY789GHI', 'Rented', 1, 65.99, 5, 2, 3, 4, TRUE),
('NYC-LUX004', 'BMW', '330i', 'Luxury', 'Gasoline', 'Automatic', 'NY321JKL', 'Available', 1, 125.99, 5, 2, 3, 4, TRUE),
('NYC-SUV005', 'Toyota', 'RAV4', 'SUV', 'Gasoline', 'Automatic', 'NY654MNO', 'Available', 1, 89.99, 5, 3, 4, 5, TRUE),

-- LAX Branch Vehicles (branch_id = 2)
('LAX-ECO006', 'Hyundai', 'Elantra', 'Economy', 'Gasoline', 'Automatic', 'CA987PQR', 'Available', 2, 48.99, 5, 1, 2, 4, TRUE),
('LAX-MID007', 'Chevrolet', 'Malibu', 'Midsize', 'Gasoline', 'Automatic', 'CA147STU', 'Maintenance', 2, 62.99, 5, 2, 3, 4, TRUE),
('LAX-LUX008', 'Mercedes-Benz', 'C-Class', 'Luxury', 'Gasoline', 'Automatic', 'CA258VWX', 'Available', 2, 145.99, 5, 2, 3, 4, TRUE),
('LAX-SUV009', 'Ford', 'Explorer', 'SUV', 'Gasoline', 'Automatic', 'CA369YZA', 'Rented', 2, 95.99, 7, 4, 5, 5, TRUE),
('LAX-VAN010', 'Honda', 'Odyssey', 'Van', 'Gasoline', 'Automatic', 'CA741BCD', 'Available', 2, 115.99, 8, 3, 6, 5, TRUE),

-- MIA Branch Vehicles (branch_id = 3)
('MIA-ECO011', 'Kia', 'Rio', 'Economy', 'Gasoline', 'Automatic', 'FL852EFG', 'Available', 3, 41.99, 5, 1, 2, 4, TRUE),
('MIA-CON012', 'Ford', 'Mustang Convertible', 'Convertible', 'Gasoline', 'Manual', 'FL963HIJ', 'Available', 3, 155.99, 4, 1, 2, 2, TRUE),
('MIA-LUX013', 'Audi', 'A4', 'Luxury', 'Gasoline', 'Automatic', 'FL159KLM', 'Available', 3, 135.99, 5, 2, 3, 4, TRUE),

-- CHI Branch Vehicles (branch_id = 4)
('CHI-ECO014', 'Toyota', 'Camry', 'Midsize', 'Hybrid', 'Automatic', 'IL753NOP', 'Available', 4, 68.99, 5, 2, 3, 4, TRUE),

-- LAS Branch Vehicles (branch_id = 5)
('LAS-LUX015', 'Cadillac', 'Escalade', 'Luxury SUV', 'Gasoline', 'Automatic', 'NV486QRS', 'Available', 5, 195.99, 7, 4, 6, 5, TRUE);

-- =====================================
-- Staff Sample Data
-- =====================================
INSERT INTO Staff (staff_code, first_name, last_name, email, position, branch_id, hire_date) VALUES
('STAFF001', 'Mark', 'Stevens', 'mark.stevens@carrental.com', 'Branch Manager', 1, '2020-01-15'),
('STAFF002', 'Jennifer', 'Lee', 'jennifer.lee@carrental.com', 'Customer Service', 1, '2021-03-22'),
('STAFF003', 'Carlos', 'Rodriguez', 'carlos.rodriguez@carrental.com', 'Maintenance Supervisor', 1, '2019-08-10'),
('STAFF004', 'Michelle', 'White', 'michelle.white@carrental.com', 'Branch Manager', 2, '2019-11-05'),
('STAFF005', 'Kevin', 'Taylor', 'kevin.taylor@carrental.com', 'Customer Service', 2, '2022-02-14'),
('STAFF006', 'Nancy', 'Harris', 'nancy.harris@carrental.com', 'Customer Service', 3, '2021-07-30'),
('STAFF007', 'Tony', 'Clark', 'tony.clark@carrental.com', 'Branch Manager', 4, '2020-09-12'),
('STAFF008', 'Rachel', 'Lewis', 'rachel.lewis@carrental.com', 'Customer Service', 5, '2022-01-08');

-- =====================================
-- Promo Offer Sample Data
-- =====================================
INSERT INTO PromoOffer (name, discount_percent, valid_from, valid_to, conditions) VALUES
('Summer Special 2024', 15, '2024-06-01', '2024-08-31', 'Valid for rentals of 3 days or more'),
('Weekend Warrior', 10, '2024-01-01', '2024-12-31', 'Valid for Friday-Sunday rentals only'),
('Business Traveler', 20, '2024-03-01', '2024-12-31', 'Valid for luxury vehicles, weekday rentals'),
('Holiday Season', 25, '2024-11-25', '2025-01-05', 'Valid for all vehicle types during holiday season'),
('New Customer Welcome', 30, '2024-01-01', '2024-12-31', 'First-time customers only, maximum $50 discount'),
('Loyalty Bonus', 12, '2024-01-01', '2024-12-31', 'Valid for Gold and Platinum loyalty members only');

-- =====================================
-- Rental Sample Data
-- =====================================
INSERT INTO Rental (vehicle_id, customer_id, staff_id, pickup_branch_id, return_branch_id, pickup_datetime, return_datetime, actual_return_datetime, status, booked_via, total_cost, is_one_way, driver_age, deposit_paid_online, payment_due_at_pickup) VALUES
-- Completed rentals
(1, 1, 1, 1, 1, '2024-08-15 10:00:00', '2024-08-18 10:00:00', '2024-08-18 09:45:00', 'Completed', 'Website', 137.97, FALSE, 35, 50.00, 87.97),
(3, 2, 2, 1, 1, '2024-08-20 14:00:00', '2024-08-25 14:00:00', '2024-08-25 16:30:00', 'Completed', 'Mobile App', 329.95, FALSE, 28, 100.00, 229.95),
(8, 3, 4, 2, 2, '2024-09-01 09:00:00', '2024-09-07 09:00:00', '2024-09-07 08:30:00', 'Completed', 'Phone', 875.94, FALSE, 42, 200.00, 675.94),
(12, 4, 6, 3, 3, '2024-09-05 12:00:00', '2024-09-08 12:00:00', '2024-09-08 14:15:00', 'Completed', 'Website', 467.97, FALSE, 29, 150.00, 317.97),
(14, 5, 7, 4, 4, '2024-09-10 08:00:00', '2024-09-12 08:00:00', '2024-09-12 19:00:00', 'Completed', 'Mobile App', 137.98, FALSE, 46, 75.00, 62.98),

-- Active rentals
(9, 6, 4, 2, 2, '2024-09-20 11:00:00', '2024-09-27 11:00:00', NULL, 'Active', 'Website', 671.93, FALSE, 36, 150.00, 521.93),
(3, 7, 1, 1, 1, '2024-09-22 15:00:00', '2024-09-24 15:00:00', NULL, 'Active', 'Mobile App', 131.98, FALSE, 32, 65.00, 66.98),

-- Future reservations
(1, 8, 2, 1, 1, '2024-09-28 10:00:00', '2024-10-01 10:00:00', NULL, 'Reserved', 'Phone', 137.97, FALSE, 37, 50.00, 87.97),
(15, 9, 8, 5, 5, '2024-10-05 14:00:00', '2024-10-08 14:00:00', NULL, 'Reserved', 'Website', 587.97, FALSE, 41, 200.00, 387.97),
(11, 10, 6, 3, 3, '2024-10-10 09:00:00', '2024-10-15 09:00:00', NULL, 'Reserved', 'Mobile App', 209.95, FALSE, 33, 100.00, 109.95),

-- One-way rental
(6, 11, 4, 2, 3, '2024-09-15 13:00:00', '2024-09-18 13:00:00', '2024-09-18 12:30:00', 'Completed', 'Website', 196.97, TRUE, 34, 75.00, 121.97),

-- Late return
(2, 12, 1, 1, 1, '2024-09-12 16:00:00', '2024-09-14 16:00:00', '2024-09-15 10:30:00', 'Completed', 'Phone', 128.47, FALSE, 30, 50.00, 78.47);

-- -- =====================================
-- Loyalty Program Sample Data
-- =====================================
INSERT INTO LoyaltyProgram (customer_id, points_balance, membership_tier, date_joined) VALUES
(2, 1250, 'Gold', '2022-03-01'),
(3, 2850, 'Platinum', '2021-06-15'),
(5, 750, 'Silver', '2023-01-20'),
(7, 1850, 'Gold', '2022-08-10'),
(9, 3250, 'Platinum', '2020-11-05'),
(11, 950, 'Silver', '2023-02-28');

-- -- =====================================
-- -- RentalPromo Sample Data
-- -- =====================================
-- INSERT INTO RentalPromo (rental_id, promo_id) VALUES
-- (1, 1), -- Summer Special applied to first rental
-- (3, 2), -- Weekend Warrior applied to third rental
-- (4, 3), -- Business Traveler applied to convertible rental
-- (8, 5), -- New Customer Welcome for customer 8
-- (9, 6), -- Loyalty Bonus for loyalty member
-- (11, 1); -- Summer Special for one-way rental

-- =====================================
-- Payment Sample Data
-- =====================================
INSERT INTO Payment (rental_id, amount, payment_date, payment_method, is_successful) VALUES
-- Online deposits
(1, 50.00, '2024-08-10', 'Credit Card', TRUE),
(2, 100.00, '2024-08-18', 'Credit Card', TRUE),
(3, 200.00, '2024-08-28', 'PayPal', TRUE),
(4, 150.00, '2024-09-02', 'Credit Card', TRUE),
(5, 75.00, '2024-09-08', 'Debit Card', TRUE),
(6, 150.00, '2024-09-18', 'Credit Card', TRUE),
(7, 65.00, '2024-09-20', 'Credit Card', TRUE),
(8, 50.00, '2024-09-25', 'PayPal', TRUE),
(9, 200.00, '2024-10-01', 'Credit Card', TRUE),
(10, 100.00, '2024-10-05', 'Credit Card', TRUE),
(11, 75.00, '2024-09-12', 'Cash', TRUE),
(12, 50.00, '2024-09-10', 'Credit Card', TRUE),

-- Pickup payments (remaining balance)
(1, 87.97, '2024-08-15', 'Credit Card', TRUE),
(2, 229.95, '2024-08-20', 'Cash', TRUE),
(3, 675.94, '2024-09-01', 'Credit Card', TRUE),
(4, 317.97, '2024-09-05', 'Credit Card', TRUE),
(5, 62.98, '2024-09-10', 'Debit Card', TRUE),
(11, 121.97, '2024-09-15', 'Credit Card', TRUE),
(12, 78.47, '2024-09-12', 'Credit Card', TRUE),

-- Failed payment example
(6, 521.93, '2024-09-20', 'Credit Card', FALSE);

-- =====================================
-- Vehicle Maintenance Sample Data
-- =====================================
INSERT INTO VehicleMaintenance (vehicle_id, description, maintenance_date, cost, performed_by) VALUES
(7, 'Oil change and filter replacement', '2024-08-15', 75.50, 'QuickLube Service Center'),
(7, 'Brake pad replacement', '2024-09-01', 285.00, 'Downtown Auto Repair'),
(2, 'Tire rotation and alignment', '2024-08-22', 120.00, 'Tire World'),
(10, 'AC system repair', '2024-09-10', 450.75, 'Auto Climate Control'),
(5, 'Battery replacement', '2024-09-05', 165.99, 'Battery Plus'),
(13, 'Scheduled 30K mile service', '2024-08-30', 320.25, 'Luxury Auto Service'),
(8, 'Windshield replacement', '2024-09-12', 275.00, 'Glass Express'),
(1, 'Oil change and inspection', '2024-09-18', 68.50, 'QuickLube Service Center'),
(14, 'Transmission fluid service', '2024-09-20', 195.75, 'Transmission Specialists'),
(15, 'Detail cleaning after rental', '2024-09-15', 85.00, 'Premium Car Wash');

-- =====================================
-- Review Ratings Sample Data
-- =====================================
INSERT INTO ReviewRatings (rental_id, rating_score, review_text, review_date) VALUES
(1, 4.5, 'Great service and clean vehicle. Staff was very helpful during pickup and return process.', '2024-08-19'),
(2, 5.0, 'Excellent experience! The Honda Accord was in perfect condition and the mobile app made everything so easy.', '2024-08-26'),
(3, 4.8, 'Luxury vehicle was amazing for our business trip. Professional service throughout. Highly recommend!', '2024-09-08'),
(4, 4.2, 'Good experience overall. The convertible was fun for our Miami vacation. Minor delay at pickup but resolved quickly.', '2024-09-09'),
(5, 3.8, 'Car was good but return process took longer than expected. Staff was apologetic about the wait.', '2024-09-13'),
(11, 4.6, 'One-way rental worked perfectly for our relocation. Vehicle was reliable and staff at both locations were helpful.', '2024-09-19'),
(12, 3.5, 'Vehicle was fine but had to pay extra for late return due to flight delay. Would appreciate more flexibility.', '2024-09-16');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- -- =====================================
-- -- Verification Queries
-- -- =====================================
-- SELECT 'Data insertion completed successfully!' as status;

-- SELECT 
--     (SELECT COUNT(*) FROM Branch) as branch_count,
--     (SELECT COUNT(*) FROM Vehicle) as vehicle_count,
--     (SELECT COUNT(*) FROM Customer) as customer_count,
--     (SELECT COUNT(*) FROM Staff) as staff_count,
--     (SELECT COUNT(*) FROM Rental) as rental_count;