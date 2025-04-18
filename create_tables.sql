-- Create the Branch table
CREATE TABLE IF NOT EXISTS Branch (
    branch_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100),
    address VARCHAR(100),
    city VARCHAR(50),
    country VARCHAR(50),
    phone VARCHAR(20)
);

-- Create the Vehicle table
CREATE TABLE IF NOT EXISTS Vehicle (
    vehicle_id VARCHAR(10) PRIMARY KEY,
    brand VARCHAR(50),
    model VARCHAR(50),
    type VARCHAR(50),
    fuel_type VARCHAR(20),
    transmission VARCHAR(20),
    plate_number VARCHAR(20) UNIQUE,
    status VARCHAR(20),
    branch_id VARCHAR(10),
    daily_rate DECIMAL(10, 2),
    seating_capacity INT,
    large_luggage_capacity INT,
    small_luggage_capacity INT,
    door_count INT,
    has_air_conditioning BOOLEAN,
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
);

-- Create the Customer table
CREATE TABLE IF NOT EXISTS Customer (
    customer_id VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    license_number VARCHAR(50) UNIQUE,
    country_of_residence VARCHAR(50),
    is_loyalty_member BOOLEAN,
    loyalty_tier VARCHAR(20)
);

-- Create the Staff table
CREATE TABLE IF NOT EXISTS Staff (
    staff_id VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    position VARCHAR(50),
    branch_id VARCHAR(10),
    hire_date DATE,
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
);

-- Create the Rental table
CREATE TABLE IF NOT EXISTS Rental (
    rental_id INT PRIMARY KEY,
    vehicle_id INT,
    customer_id INT,
    staff_id INT,
    pickup_branch_id INT,
    return_branch_id INT,
    pickup_datetime DATETIME,
    return_datetime DATETIME,
    actual_return_datetime DATETIME,
    late_duration INT,
    `duration_unit` VARCHAR(10),  -- Backticks to avoid reserved keyword conflict
    status VARCHAR(20),
    booked_via VARCHAR(50),
    total_cost DECIMAL(10, 2),
    is_one_way BOOLEAN,
    driver_age INT,
    deposit_paid_online DECIMAL(10, 2),
    payment_due_at_pickup DECIMAL(10, 2),
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id),
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id),
    FOREIGN KEY (pickup_branch_id) REFERENCES Branch(branch_id),
    FOREIGN KEY (return_branch_id) REFERENCES Branch(branch_id)
);


-- Create the Payment table
CREATE TABLE IF NOT EXISTS Payment (
    payment_id VARCHAR(10) PRIMARY KEY,
    rental_id VARCHAR(20),
    amount DECIMAL(10, 2),
    payment_date DATE,
    payment_method VARCHAR(20),
    is_successful BOOLEAN,
    FOREIGN KEY (rental_id) REFERENCES Rental(rental_id)
);

-- Create the VehicleMaintenance table
CREATE TABLE IF NOT EXISTS VehicleMaintenance (
    maintenance_id VARCHAR(10) PRIMARY KEY,
    vehicle_id VARCHAR(10),
    description TEXT,
    maintenance_date DATE,
    cost DECIMAL(10, 2),
    performed_by VARCHAR(100),
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id)
);

-- Create the LoyaltyProgram table
CREATE TABLE IF NOT EXISTS LoyaltyProgram (
    program_id VARCHAR(10) PRIMARY KEY,
    customer_id VARCHAR(10),
    points_balance INT,
    membership_tier VARCHAR(20),
    date_joined DATE,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

-- Create the PromoOffer table
CREATE TABLE IF NOT EXISTS PromoOffer (
    promo_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100),
    discount_percent INT,
    valid_from DATE,
    valid_to DATE,
    conditions TEXT
);

-- Create the RentalPromo table
CREATE TABLE IF NOT EXISTS RentalPromo (
    rental_id VARCHAR(20),
    promo_id VARCHAR(20),
    PRIMARY KEY (rental_id, promo_id),
    FOREIGN KEY (rental_id) REFERENCES Rental(rental_id),
    FOREIGN KEY (promo_id) REFERENCES PromoOffer(promo_id)
);

-- Create the ReviewRatings table
CREATE TABLE IF NOT EXISTS ReviewRatings (
    review_id VARCHAR(10) PRIMARY KEY,
    rental_id VARCHAR(20),
    rating_score DECIMAL(2, 1),
    review_text TEXT,
    review_date DATE,
    FOREIGN KEY (rental_id) REFERENCES Rental(rental_id)
);
