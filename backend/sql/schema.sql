-- =====================================
-- Safe Drop
-- =====================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TRIGGER IF EXISTS trg_calc_late_duration_insert;
DROP TRIGGER IF EXISTS trg_calc_late_duration_update;
DROP TABLE IF EXISTS ReviewRatings, RentalPromo, PromoOffer, LoyaltyProgram, VehicleMaintenance, Payment, Rental, Staff, Customer, Vehicle, Branch;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================
-- Branch
-- =====================================
CREATE TABLE IF NOT EXISTS Branch (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200),
    city VARCHAR(50),
    country VARCHAR(50),
    phone VARCHAR(30)
);

-- =====================================
-- Vehicle
-- =====================================
CREATE TABLE IF NOT EXISTS Vehicle (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_code VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    type VARCHAR(50),
    fuel_type VARCHAR(20),
    transmission VARCHAR(20),
    plate_number VARCHAR(20) UNIQUE,
    status VARCHAR(20),
    branch_id INT NOT NULL,
    daily_rate DECIMAL(10,2),
    seating_capacity INT,
    large_luggage_capacity INT,
    small_luggage_capacity INT,
    door_count INT,
    has_air_conditioning BOOLEAN,
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
);

-- =====================================
-- Customer
-- =====================================
CREATE TABLE IF NOT EXISTS Customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(30),
    date_of_birth DATE,
    license_number VARCHAR(50) UNIQUE,
    country_of_residence VARCHAR(50),
    is_loyalty_member BOOLEAN DEFAULT FALSE
    -- Removed loyalty_tier - this will come from LoyaltyProgram table
);

-- =====================================
-- Staff
-- =====================================
CREATE TABLE IF NOT EXISTS Staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    position VARCHAR(50),
    branch_id INT NOT NULL,
    hire_date DATE,
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
);

-- =====================================
-- Loyalty Program
-- =====================================
-- LoyaltyProgram - One loyalty program per customer
-- =====================================
CREATE TABLE IF NOT EXISTS LoyaltyProgram (
    program_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNIQUE NOT NULL,
    points_balance INT DEFAULT 0,
    membership_tier VARCHAR(20) DEFAULT 'Bronze',
    date_joined DATE NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

-- =====================================
-- Rental
-- =====================================
CREATE TABLE IF NOT EXISTS Rental (
    rental_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    customer_id INT NOT NULL,
    staff_id INT,
    pickup_branch_id INT NOT NULL,
    return_branch_id INT NOT NULL,
    pickup_datetime DATETIME NOT NULL,
    return_datetime DATETIME NOT NULL,
    actual_return_datetime DATETIME,
    late_duration INT DEFAULT 0,
    duration_unit VARCHAR(10) DEFAULT 'minutes',
    status VARCHAR(20) NOT NULL,
    booked_via VARCHAR(50),
    total_cost DECIMAL(10,2),
    is_one_way BOOLEAN DEFAULT FALSE,
    driver_age INT,
    deposit_paid_online DECIMAL(10,2) DEFAULT 0.00,
    payment_due_at_pickup DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id),
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id),
    FOREIGN KEY (pickup_branch_id) REFERENCES Branch(branch_id),
    FOREIGN KEY (return_branch_id) REFERENCES Branch(branch_id)
);

-- Triggers: calculate late_duration on both INSERT and UPDATE
DELIMITER $$
CREATE TRIGGER trg_calc_late_duration_insert
BEFORE INSERT ON Rental
FOR EACH ROW
BEGIN
    IF NEW.actual_return_datetime IS NOT NULL 
       AND NEW.return_datetime IS NOT NULL 
       AND NEW.actual_return_datetime > NEW.return_datetime THEN
        SET NEW.late_duration = TIMESTAMPDIFF(MINUTE, NEW.return_datetime, NEW.actual_return_datetime);
    ELSE
        SET NEW.late_duration = 0;
    END IF;
END$$

CREATE TRIGGER trg_calc_late_duration_update
BEFORE UPDATE ON Rental
FOR EACH ROW
BEGIN
    IF NEW.actual_return_datetime IS NOT NULL 
       AND NEW.return_datetime IS NOT NULL 
       AND NEW.actual_return_datetime > NEW.return_datetime THEN
        SET NEW.late_duration = TIMESTAMPDIFF(MINUTE, NEW.return_datetime, NEW.actual_return_datetime);
    ELSE
        SET NEW.late_duration = 0;
    END IF;
END$$
DELIMITER ;

-- =====================================
-- Payment
-- =====================================
CREATE TABLE IF NOT EXISTS Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    rental_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(30),
    is_successful BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (rental_id) REFERENCES Rental(rental_id)
);

-- =====================================
-- Vehicle Maintenance
-- =====================================
CREATE TABLE IF NOT EXISTS VehicleMaintenance (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    description TEXT,
    maintenance_date DATE NOT NULL,
    cost DECIMAL(10,2),
    performed_by VARCHAR(100),
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id)
);

-- =====================================
-- Promo Offer
-- =====================================
CREATE TABLE IF NOT EXISTS PromoOffer (
    promo_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    discount_percent INT,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    conditions TEXT
);

-- -- =====================================
-- -- RentalPromo (Junction Table)
-- -- =====================================
-- CREATE TABLE IF NOT EXISTS RentalPromo (
--     rental_id INT NOT NULL,
--     promo_id INT NOT NULL,
--     PRIMARY KEY (rental_id, promo_id),
--     FOREIGN KEY (rental_id) REFERENCES Rental(rental_id) ON DELETE CASCADE,
--     FOREIGN KEY (promo_id) REFERENCES PromoOffer(promo_id) ON DELETE CASCADE
-- );

-- =====================================
-- Review Ratings
-- =====================================
-- One review per rental
CREATE TABLE IF NOT EXISTS ReviewRatings (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    rental_id INT UNIQUE NOT NULL,
    rating_score DECIMAL(2,1) CHECK (rating_score >= 1.0 AND rating_score <= 5.0),
    review_text TEXT,
    review_date DATE NOT NULL,
    FOREIGN KEY (rental_id) REFERENCES Rental(rental_id)
);

-- =====================================
-- Indexes for Performance
-- =====================================
CREATE INDEX idx_rental_customer ON Rental(customer_id);
CREATE INDEX idx_rental_vehicle ON Rental(vehicle_id);
CREATE INDEX idx_rental_pickup_datetime ON Rental(pickup_datetime);
CREATE INDEX idx_rental_return_datetime ON Rental(return_datetime);
CREATE INDEX idx_rental_status ON Rental(status);
CREATE INDEX idx_vehicle_branch ON Vehicle(branch_id);
CREATE INDEX idx_vehicle_status ON Vehicle(status);
CREATE INDEX idx_payment_rental ON Payment(rental_id);
CREATE INDEX idx_payment_date ON Payment(payment_date);
CREATE INDEX idx_maintenance_vehicle ON VehicleMaintenance(vehicle_id);
CREATE INDEX idx_maintenance_date ON VehicleMaintenance(maintenance_date);
CREATE INDEX idx_promo_dates ON PromoOffer(valid_from, valid_to);
CREATE INDEX idx_customer_email ON Customer(email);
CREATE INDEX idx_customer_loyalty ON Customer(is_loyalty_member);

-- =====================================
-- Trigger to Auto-update Customer Loyalty Status
-- =====================================
DELIMITER $$
CREATE TRIGGER trg_update_loyalty_status_insert
AFTER INSERT ON LoyaltyProgram
FOR EACH ROW
BEGIN
    UPDATE Customer 
    SET is_loyalty_member = TRUE 
    WHERE customer_id = NEW.customer_id;
END$$

CREATE TRIGGER trg_update_loyalty_status_delete
AFTER DELETE ON LoyaltyProgram
FOR EACH ROW
BEGIN
    UPDATE Customer 
    SET is_loyalty_member = FALSE 
    WHERE customer_id = OLD.customer_id;
END$$
DELIMITER ;