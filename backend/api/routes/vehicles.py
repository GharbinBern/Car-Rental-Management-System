from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from backend.database.connection import connect_db

router = APIRouter()


class VehicleBase(BaseModel):
    brand: str
    model: str
    type: Optional[str] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    status: str = Field(default="available")
    daily_rate: float = Field(..., ge=0)
    seating_capacity: Optional[int] = None


class VehicleCreate(VehicleBase):
    vehicle_code: str = Field(..., min_length=2, max_length=10)


class VehicleUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    type: Optional[str] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    status: Optional[str] = None
    daily_rate: Optional[float] = Field(None, ge=0)
    seating_capacity: Optional[int] = None


class VehicleOut(VehicleBase):
    vehicle_id: int
    vehicle_code: str


@router.get("/", response_model=List[VehicleOut])
def get_vehicles(
    status: Optional[str] = None,
    search: Optional[str] = None
):
    """
    Return all vehicles from the database as JSON.
    Optionally filter by status and search term.
    """
    db = connect_db()
    cursor = db.cursor()
    
    query = """
        SELECT vehicle_id, vehicle_code, brand, model, type, fuel_type, transmission, status, daily_rate, seating_capacity
        FROM Vehicle
        WHERE 1=1
    """
    params = []
    
    if status:
        query += " AND status = %s"
        params.append(status)
        
    if search:
        query += """ 
            AND (
                LOWER(vehicle_code) LIKE %s
                OR LOWER(brand) LIKE %s
                OR LOWER(model) LIKE %s
            )
        """
        search_term = f"%{search.lower()}%"
        params.extend([search_term, search_term, search_term])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    cursor.close()
    db.close()

    return [
        VehicleOut(
            vehicle_id=row[0],
            vehicle_code=row[1],
            brand=row[2],
            model=row[3],
            type=row[4],
            fuel_type=row[5],
            transmission=row[6],
            status=row[7],
            daily_rate=float(row[8]) if row[8] is not None else 0.0,
            seating_capacity=row[9]
        )
        for row in rows
    ]


@router.get("/{vehicle_code}", response_model=VehicleOut)
def get_vehicle(vehicle_code: str):
    db = connect_db()
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT vehicle_id, vehicle_code, brand, model, type, fuel_type, transmission, status, daily_rate, seating_capacity
        FROM Vehicle
        WHERE vehicle_code = %s
        """,
        (vehicle_code,)
    )
    v = cursor.fetchone()
    cursor.close()
    db.close()

    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return VehicleOut(
        vehicle_id=v[0],
        vehicle_code=v[1],
        brand=v[2],
        model=v[3],
        type=v[4],
        fuel_type=v[5],
        transmission=v[6],
        status=v[7],
        daily_rate=float(v[8]) if v[8] is not None else 0.0,
        seating_capacity=v[9]
    )

@router.post("/", response_model=VehicleOut, status_code=201)
def create_vehicle(vehicle: VehicleCreate):
    db = connect_db()
    cursor = db.cursor()
    
    # Check if vehicle code already exists
    cursor.execute("SELECT 1 FROM Vehicle WHERE vehicle_code = %s", (vehicle.vehicle_code,))
    if cursor.fetchone():
        cursor.close()
        db.close()
        raise HTTPException(status_code=400, detail="Vehicle code already exists")
    
    try:
        # Get a default branch_id (assuming branch_id=1 exists)
        cursor.execute("SELECT branch_id FROM Branch LIMIT 1")
        branch_result = cursor.fetchone()
        default_branch_id = branch_result[0] if branch_result else 1
        
        cursor.execute(
            """
            INSERT INTO Vehicle (
                vehicle_code, brand, model, type, fuel_type, transmission, 
                status, daily_rate, seating_capacity, branch_id
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                vehicle.vehicle_code,
                vehicle.brand,
                vehicle.model,
                vehicle.type,
                vehicle.fuel_type,
                vehicle.transmission,
                vehicle.status,
                vehicle.daily_rate,
                vehicle.seating_capacity,
                default_branch_id
            )
        )
        db.commit()
        
        # Fetch the created vehicle
        cursor.execute(
            """
            SELECT vehicle_id, vehicle_code, brand, model, type, fuel_type, transmission, status, daily_rate, seating_capacity
            FROM Vehicle 
            WHERE vehicle_code = %s
            """,
            (vehicle.vehicle_code,)
        )
        new_vehicle = cursor.fetchone()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()
    
    return VehicleOut(
        vehicle_id=new_vehicle[0],
        vehicle_code=new_vehicle[1],
        brand=new_vehicle[2],
        model=new_vehicle[3],
        type=new_vehicle[4],
        fuel_type=new_vehicle[5],
        transmission=new_vehicle[6],
        status=new_vehicle[7],
        daily_rate=float(new_vehicle[8]),
        seating_capacity=new_vehicle[9]
    )

@router.put("/{vehicle_code}", response_model=VehicleOut)
def update_vehicle(vehicle_code: str, vehicle: VehicleUpdate):
    db = connect_db()
    cursor = db.cursor()
    
    # Check if vehicle exists
    cursor.execute("SELECT 1 FROM Vehicle WHERE vehicle_code = %s", (vehicle_code,))
    if not cursor.fetchone():
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Build update query dynamically based on provided fields
    update_fields = []
    values = []
    for field, value in vehicle.dict(exclude_unset=True).items():
        if value is not None:
            update_fields.append(f"{field} = %s")
            values.append(value)
    
    if not update_fields:
        cursor.close()
        db.close()
        return get_vehicle(vehicle_code)
    
    values.append(vehicle_code)
    query = f"""
        UPDATE Vehicle
        SET {", ".join(update_fields)}
        WHERE vehicle_code = %s
    """
    
    try:
        cursor.execute(query, values)
        db.commit()
        
        # Fetch the updated vehicle
        cursor.execute(
            """
            SELECT vehicle_id, vehicle_code, brand, model, type, fuel_type, transmission, status, daily_rate, seating_capacity
            FROM Vehicle 
            WHERE vehicle_code = %s
            """,
            (vehicle_code,)
        )
        updated_vehicle = cursor.fetchone()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()
    
    return VehicleOut(
        vehicle_id=updated_vehicle[0],
        vehicle_code=updated_vehicle[1],
        brand=updated_vehicle[2],
        model=updated_vehicle[3],
        type=updated_vehicle[4],
        fuel_type=updated_vehicle[5],
        transmission=updated_vehicle[6],
        status=updated_vehicle[7],
        daily_rate=float(updated_vehicle[8]),
        seating_capacity=updated_vehicle[9]
    )
