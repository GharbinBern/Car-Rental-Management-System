from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date
import json

from db_layer.connection import connect_db

router = APIRouter()


class RentalCreate(BaseModel):
    customer_id: int
    vehicle_code: str
    start_date: date
    expected_end_date: date


class RentalUpdate(BaseModel):
    end_date: date = Field(...)
    additional_charges: float = Field(default=0, ge=0)
    notes: Optional[str] = None


class RentalOut(BaseModel):
    rental_id: int
    customer_id: int
    customer_name: str
    vehicle_code: str
    vehicle_info: str
    daily_rate: float
    start_date: date
    expected_end_date: date
    end_date: Optional[date] = None
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
            c.name as customer_name,
            r.vehicle_code,
            CONCAT(v.brand, ' ', v.model) as vehicle_info,
            v.daily_rate,
            r.start_date,
            r.expected_end_date,
            r.end_date,
            CASE
                WHEN r.end_date IS NULL THEN 'ongoing'
                ELSE 'completed'
            END as status,
            r.total_cost
        FROM Rental r
        JOIN Customer c ON r.customer_id = c.customer_id
        JOIN Vehicle v ON r.vehicle_code = v.vehicle_code
        WHERE 1=1
    """
    params = []
    
    if status:
        if status == 'ongoing':
            query += " AND r.end_date IS NULL"
        elif status == 'completed':
            query += " AND r.end_date IS NOT NULL"
    
    if customer_id:
        query += " AND r.customer_id = %s"
        params.append(customer_id)
        
    if vehicle_code:
        query += " AND r.vehicle_code = %s"
        params.append(vehicle_code)
        
    query += " ORDER BY r.start_date DESC"
    
    cursor.execute(query, params)
    rentals = cursor.fetchall()
    cursor.close()
    db.close()
    
    return [
        RentalOut(
            rental_id=r[0],
            customer_id=r[1],
            customer_name=r[2],
            vehicle_code=r[3],
            vehicle_info=r[4],
            daily_rate=float(r[5]),
            start_date=r[6],
            expected_end_date=r[7],
            end_date=r[8],
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
            c.name as customer_name,
            r.vehicle_code,
            CONCAT(v.brand, ' ', v.model) as vehicle_info,
            v.daily_rate,
            r.start_date,
            r.expected_end_date,
            r.end_date,
            CASE
                WHEN r.end_date IS NULL THEN 'ongoing'
                ELSE 'completed'
            END as status,
            r.total_cost
        FROM Rental r
        JOIN Customer c ON r.customer_id = c.customer_id
        JOIN Vehicle v ON r.vehicle_code = v.vehicle_code
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
        vehicle_code=rental[3],
        vehicle_info=rental[4],
        daily_rate=float(rental[5]),
        start_date=rental[6],
        expected_end_date=rental[7],
        end_date=rental[8],
        status=rental[9],
        total_cost=float(rental[10]) if rental[10] is not None else None
    )


@router.post("/", response_model=RentalOut, status_code=201)
def create_rental(rental: RentalCreate):
    """Create a new rental"""
    db = connect_db()
    cursor = db.cursor()
    
    # Verify customer exists
    cursor.execute("SELECT name FROM Customer WHERE customer_id = %s", (rental.customer_id,))
    customer = cursor.fetchone()
    if not customer:
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Verify vehicle exists and is available
    cursor.execute(
        "SELECT CONCAT(brand, ' ', model), daily_rate, status FROM Vehicle WHERE vehicle_code = %s",
        (rental.vehicle_code,)
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
        # Create rental
        cursor.execute("""
            INSERT INTO Rental (
                customer_id, vehicle_code, start_date, expected_end_date
            ) VALUES (%s, %s, %s, %s)
            RETURNING rental_id
        """, (
            rental.customer_id,
            rental.vehicle_code,
            rental.start_date,
            rental.expected_end_date
        ))
        
        rental_id = cursor.fetchone()[0]
        
        # Update vehicle status
        cursor.execute(
            "UPDATE Vehicle SET status = 'rented' WHERE vehicle_code = %s",
            (rental.vehicle_code,)
        )
        
        db.commit()
        
        # Fetch the created rental
        cursor.execute("""
            SELECT 
                r.rental_id,
                r.customer_id,
                c.name as customer_name,
                r.vehicle_code,
                CONCAT(v.brand, ' ', v.model) as vehicle_info,
                v.daily_rate,
                r.start_date,
                r.expected_end_date,
                r.end_date,
                'ongoing' as status,
                r.total_cost
            FROM Rental r
            JOIN Customer c ON r.customer_id = c.customer_id
            JOIN Vehicle v ON r.vehicle_code = v.vehicle_code
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
        vehicle_code=new_rental[3],
        vehicle_info=new_rental[4],
        daily_rate=float(new_rental[5]),
        start_date=new_rental[6],
        expected_end_date=new_rental[7],
        end_date=new_rental[8],
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
        SELECT r.vehicle_code, r.start_date, v.daily_rate
        FROM Rental r
        JOIN Vehicle v ON r.vehicle_code = v.vehicle_code
        WHERE r.rental_id = %s AND r.end_date IS NULL
    """, (rental_id,))
    
    rental = cursor.fetchone()
    if not rental:
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Rental not found or already completed")
    
    vehicle_code, start_date, daily_rate = rental
    
    # Calculate total cost
    days_rented = (return_data.end_date - start_date).days + 1
    total_cost = days_rented * float(daily_rate) + return_data.additional_charges
    
    try:
        # Update rental
        cursor.execute("""
            UPDATE Rental
            SET end_date = %s, total_cost = %s, notes = %s
            WHERE rental_id = %s
        """, (return_data.end_date, total_cost, return_data.notes, rental_id))
        
        # Update vehicle status
        cursor.execute(
            "UPDATE Vehicle SET status = 'available' WHERE vehicle_code = %s",
            (vehicle_code,)
        )
        
        db.commit()
        
        # Fetch updated rental
        cursor.execute("""
            SELECT 
                r.rental_id,
                r.customer_id,
                c.name as customer_name,
                r.vehicle_code,
                CONCAT(v.brand, ' ', v.model) as vehicle_info,
                v.daily_rate,
                r.start_date,
                r.expected_end_date,
                r.end_date,
                'completed' as status,
                r.total_cost
            FROM Rental r
            JOIN Customer c ON r.customer_id = c.customer_id
            JOIN Vehicle v ON r.vehicle_code = v.vehicle_code
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
        vehicle_code=updated_rental[3],
        vehicle_info=updated_rental[4],
        daily_rate=float(updated_rental[5]),
        start_date=updated_rental[6],
        expected_end_date=updated_rental[7],
        end_date=updated_rental[8],
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
