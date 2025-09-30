-- Manager View
CREATE OR REPLACE VIEW ManagerOverview AS
SELECT 
    r.rental_id, 
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    CONCAT(v.brand, ' ', v.model) AS vehicle,
    r.total_cost, 
    r.status, 
    r.pickup_datetime, 
    r.return_datetime
FROM Rental r
JOIN Customer c ON r.customer_id = c.customer_id
JOIN Vehicle v ON r.vehicle_id = v.vehicle_id;

-- Staff View
CREATE OR REPLACE VIEW StaffRentalTasks AS
SELECT 
    r.rental_id, 
    r.pickup_branch_id, 
    r.return_branch_id, 
    r.pickup_datetime, 
    r.return_datetime, 
    r.status
FROM Rental r
WHERE r.status != 'Returned';

-- Branch View
CREATE OR REPLACE VIEW branch_view AS
SELECT 
    b.branch_code,
    b.name AS branch_name,
    COUNT(DISTINCT v.vehicle_id) AS total_vehicles,
    COUNT(DISTINCT r.rental_id) AS total_rentals,
    IFNULL(SUM(r.total_cost), 0) AS total_income
FROM Branch b
LEFT JOIN Vehicle v ON v.branch_id = b.branch_id
LEFT JOIN Rental r ON r.pickup_branch_id = b.branch_id
GROUP BY b.branch_id;

