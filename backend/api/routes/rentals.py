from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date
import json

from backend.database.connection import connect_db

router = APIRouter()


class RentalCreate(BaseModel):
    customer_id: int
    vehicle_id: int
    pickup_datetime: str
    return_datetime: str


class RentalUpdate(BaseModel):
    actual_return_datetime: str = Field(...)
    additional_charges: float = Field(default=0, ge=0)
    notes: Optional[str] = None


class RentalOut(BaseModel):
    rental_id: int
    customer_id: int
    customer_name: str
    vehicle_id: int
    vehicle_info: str
    daily_rate: float
    pickup_date: str
    expected_return_date: str
    actual_return_date: Optional[str] = None
    status: str
    total_cost: Optional[float] = None


@router.get("/", response_model=List[RentalOut])
def get_rentals(
    status: Optional[str] = Query(None, pattern="^(ongoing|completed|cancelled)$"),
    customer_id: Optional[int] = None,
    vehicle_code: Optional[str] = None
):
    """Get all rentals, optionally filtered by status, customer, or vehicle"""
    db = connect_db()
    cursor = db.cursor()
    
    query = """
        SELECT 
            r.rental_id,
            r.customer_id,
            CONCAT(c.first_name, ' ', c.last_name) as customer_name,
            r.vehicle_id,
            CONCAT(v.brand, ' ', v.model) as vehicle_info,
            v.daily_rate,
            DATE(r.pickup_datetime) as pickup_date,
            DATE(r.return_datetime) as expected_return_date,
            DATE(r.actual_return_datetime) as actual_return_date,
            r.status,
            r.total_cost
        FROM Rental r
        JOIN Customer c ON r.customer_id = c.customer_id
        JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
        WHERE 1=1
    """
    params = []
    
    if status:
        if status == 'ongoing':
            query += " AND r.actual_return_datetime IS NULL"
        elif status == 'completed':
            query += " AND r.actual_return_datetime IS NOT NULL"
    
    if customer_id:
        query += " AND r.customer_id = %s"
        params.append(customer_id)
        
    if vehicle_code:
        query += " AND v.vehicle_id = %s"
        params.append(vehicle_code)
        
    query += " ORDER BY r.pickup_datetime DESC"
    
    cursor.execute(query, params)
    rentals = cursor.fetchall()
    cursor.close()
    db.close()
    
    return [
        RentalOut(
            rental_id=r[0],
            customer_id=r[1],
            customer_name=r[2],
            vehicle_id=r[3],
            vehicle_info=r[4],
            daily_rate=float(r[5]),
            pickup_date=str(r[6]) if r[6] else None,
            expected_return_date=str(r[7]) if r[7] else None,
            actual_return_date=str(r[8]) if r[8] is not None else None,
            status=r[9],
            total_cost=float(r[10]) if r[10] is not None else None
        )
        for r in rentals
    ]


@router.get("/{rental_id}", response_model=RentalOut)
def get_rental(rental_id: int):
    """Get a specific rental by ID"""
    db = connect_db()
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT 
            r.rental_id,
            r.customer_id,
            CONCAT(c.first_name, ' ', c.last_name) as customer_name,
            r.vehicle_id,
            CONCAT(v.brand, ' ', v.model) as vehicle_info,
            v.daily_rate,
            DATE(r.pickup_datetime) as pickup_date,
            DATE(r.return_datetime) as return_date,
            DATE(r.actual_return_datetime) as actual_return_date,
            r.status,
            r.total_cost
        FROM Rental r
        JOIN Customer c ON r.customer_id = c.customer_id
        JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
        WHERE r.rental_id = %s
    """, (rental_id,))
    
    rental = cursor.fetchone()
    cursor.close()
    db.close()
    
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
        
    return RentalOut(
        rental_id=rental[0],
        customer_id=rental[1],
        customer_name=rental[2],
        vehicle_id=rental[3],
        vehicle_info=rental[4],
        daily_rate=float(rental[5]),
        pickup_date=str(rental[6]) if rental[6] else None,
        expected_return_date=str(rental[7]) if rental[7] else None,
        actual_return_date=str(rental[8]) if rental[8] is not None else None,
        status=rental[9],
        total_cost=float(rental[10]) if rental[10] is not None else None
    )


@router.post("/", response_model=RentalOut, status_code=201)
def create_rental(rental: RentalCreate):
    """Create a new rental"""
    db = connect_db()
    cursor = db.cursor()
    
    # Verify customer exists
    cursor.execute("SELECT CONCAT(first_name, ' ', last_name) FROM Customer WHERE customer_id = %s", (rental.customer_id,))
    customer = cursor.fetchone()
    if not customer:
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Verify vehicle exists and is available
    cursor.execute(
        "SELECT CONCAT(brand, ' ', model), daily_rate, status FROM Vehicle WHERE vehicle_id = %s",
        (rental.vehicle_id,)
    )
    vehicle = cursor.fetchone()
    if not vehicle:
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    if vehicle[2].lower() != 'available':
        cursor.close()
        db.close()
        raise HTTPException(status_code=400, detail="Vehicle is not available")
    
    try:
        # Calculate total cost based on rental duration and daily rate
        from datetime import datetime
        pickup_dt = datetime.fromisoformat(rental.pickup_datetime.replace('Z', '+00:00'))
        return_dt = datetime.fromisoformat(rental.return_datetime.replace('Z', '+00:00'))
        duration_days = max(1, (return_dt - pickup_dt).days)
        daily_rate = float(vehicle[1])
        estimated_total_cost = duration_days * daily_rate
        
        # Use default branch ID (branch should exist in database)
        default_branch_id = 1
        
        # Create rental with calculated total cost
        cursor.execute("""
            INSERT INTO Rental (
                customer_id, vehicle_id, pickup_branch_id, return_branch_id, 
                pickup_datetime, return_datetime, status, total_cost
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            rental.customer_id,
            rental.vehicle_id,
            default_branch_id,
            default_branch_id,
            rental.pickup_datetime,
            rental.return_datetime,
            'Active',
            estimated_total_cost
        ))
        
        rental_id = cursor.lastrowid
        
        # Update vehicle status
        cursor.execute(
            "UPDATE Vehicle SET status = 'Rented' WHERE vehicle_id = %s",
            (rental.vehicle_id,)
        )
        
        db.commit()
        
        # Fetch the created rental
        cursor.execute("""
            SELECT 
                r.rental_id,
                r.customer_id,
                CONCAT(c.first_name, ' ', c.last_name) as customer_name,
                r.vehicle_id,
                CONCAT(v.brand, ' ', v.model) as vehicle_info,
                v.daily_rate,
                DATE(r.pickup_datetime) as pickup_date,
                DATE(r.return_datetime) as expected_return_date,
                DATE(r.actual_return_datetime) as actual_return_date,
                r.status,
                r.total_cost
            FROM Rental r
            JOIN Customer c ON r.customer_id = c.customer_id
            JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
            WHERE r.rental_id = %s
        """, (rental_id,))
        
        new_rental = cursor.fetchone()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()
    
    return RentalOut(
        rental_id=new_rental[0],
        customer_id=new_rental[1],
        customer_name=new_rental[2],
        vehicle_id=new_rental[3],
        vehicle_info=new_rental[4],
        daily_rate=float(new_rental[5]),
        pickup_date=str(new_rental[6]) if new_rental[6] is not None else None,
        expected_return_date=str(new_rental[7]) if new_rental[7] is not None else None,
        actual_return_date=str(new_rental[8]) if new_rental[8] is not None else None,
        status=new_rental[9],
        total_cost=float(new_rental[10]) if new_rental[10] is not None else None
    )


@router.post("/{rental_id}/return", response_model=RentalOut)
def return_vehicle(rental_id: int, return_data: RentalUpdate):
    """Process a vehicle return"""
    db = connect_db()
    cursor = db.cursor()
    
    # Check if rental exists and is ongoing
    cursor.execute("""
        SELECT r.vehicle_id, DATE(r.pickup_datetime), v.daily_rate
        FROM Rental r
        JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
        WHERE r.rental_id = %s AND r.actual_return_datetime IS NULL
    """, (rental_id,))
    
    rental = cursor.fetchone()
    if not rental:
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Rental not found or already completed")
    
    vehicle_id, pickup_date, daily_rate = rental
    
    # Calculate total cost - parse the actual_return_datetime from the return_data
    from datetime import datetime
    actual_return = datetime.fromisoformat(return_data.actual_return_datetime.replace('Z', '+00:00'))
    days_rented = max(1, (actual_return.date() - pickup_date).days + 1)
    total_cost = days_rented * float(daily_rate) + return_data.additional_charges
    
    try:
        # Update rental
        cursor.execute("""
            UPDATE Rental
            SET actual_return_datetime = %s, total_cost = %s, status = 'Completed'
            WHERE rental_id = %s
        """, (return_data.actual_return_datetime, total_cost, rental_id))
        
        # Update vehicle status
        cursor.execute(
            "UPDATE Vehicle SET status = 'Available' WHERE vehicle_id = %s",
            (vehicle_id,)
        )
        
        db.commit()
        
        # Fetch updated rental
        cursor.execute("""
            SELECT 
                r.rental_id,
                r.customer_id,
                CONCAT(c.first_name, ' ', c.last_name) as customer_name,
                r.vehicle_id,
                CONCAT(v.brand, ' ', v.model) as vehicle_info,
                v.daily_rate,
                DATE(r.pickup_datetime) as pickup_date,
                DATE(r.return_datetime) as expected_return_date,
                DATE(r.actual_return_datetime) as actual_return_date,
                'Completed' as status,
                r.total_cost
            FROM Rental r
            JOIN Customer c ON r.customer_id = c.customer_id
            JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
            WHERE r.rental_id = %s
        """, (rental_id,))
        
        updated_rental = cursor.fetchone()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()
    
    return RentalOut(
        rental_id=updated_rental[0],
        customer_id=updated_rental[1],
        customer_name=updated_rental[2],
        vehicle_id=updated_rental[3],
        vehicle_info=updated_rental[4],
        daily_rate=float(updated_rental[5]),
        pickup_date=str(updated_rental[6]) if updated_rental[6] is not None else None,
        expected_return_date=str(updated_rental[7]) if updated_rental[7] is not None else None,
        actual_return_date=str(updated_rental[8]) if updated_rental[8] is not None else None,
        status=updated_rental[9],
        total_cost=float(updated_rental[10]) if updated_rental[10] is not None else None
    )

    # Insert rental (include required branch ids)
    insert_q = """
        INSERT INTO Rental (
            vehicle_id, customer_id, pickup_branch_id, return_branch_id,
            pickup_datetime, return_datetime, total_cost, status, booked_via
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'Booked', 'API');
    """
    try:
        cursor.execute(insert_q, (
            vehicle_id, customer_id, pickup_branch_id, return_branch_id,
            pickup_dt, return_dt, data.total_cost
        ))
    except Exception as e:
        db.rollback()
        cursor.close()
        db.close()
        raise HTTPException(status_code=500, detail=str(e))
    rental_id = cursor.lastrowid

    # Update vehicle status
    cursor.execute("UPDATE Vehicle SET status='Rented' WHERE vehicle_id=%s", (vehicle_id,))
    db.commit()
    cursor.close()
    db.close()

    return {"rental_id": rental_id, "status": "booked", "vehicle_code": data.vehicle_code}
