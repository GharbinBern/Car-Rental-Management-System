
## Manager View

CREATE VIEW ManagerOverview AS
SELECT r.rental_id, c.first_name || ' ' || c.last_name AS customer_name,
       v.brand || ' ' || v.model AS vehicle,
       r.total_cost, r.status, r.pickup_datetime, r.return_datetime
FROM Rental r
JOIN Customer c ON r.customer_id = c.customer_id
JOIN Vehicle v ON r.vehicle_id = v.vehicle_id;


## Staff View

CREATE VIEW StaffRentalTasks AS
SELECT r.rental_id, r.pickup_branch_id, r.return_branch_id, r.pickup_datetime, r.return_datetime, r.status
FROM Rental r
WHERE r.status != 'Returned';


CREATE VIEW branch_view AS
SELECT 
    b.branch_id,
    b.name,
    b.city,
    b.country,
    COUNT(v.vehicle_id) AS total_vehicles,
    COUNT(r.rental_id) AS total_rentals
FROM 
    Branch b
LEFT JOIN Vehicle v ON b.branch_id = v.branch_id
LEFT JOIN Rental r ON b.branch_id = r.pickup_branch_id OR b.branch_id = r.return_branch_id
GROUP BY 
    b.branch_id;
