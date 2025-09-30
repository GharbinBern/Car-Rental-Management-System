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
        SELECT vehicle_code, brand, model, type, fuel_type, transmission, status, daily_rate, seating_capacity
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
            vehicle_code=row[0],
            brand=row[1],
            model=row[2],
            type=row[3],
            fuel_type=row[4],
            transmission=row[5],
            status=row[6],
            daily_rate=float(row[7]) if row[7] is not None else 0.0,
            seating_capacity=row[8]
        )
        for row in rows
    ]


@router.get("/{vehicle_code}", response_model=VehicleOut)
def get_vehicle(vehicle_code: str):
    db = connect_db()
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT vehicle_code, brand, model, year, status, daily_rate
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
        vehicle_code=v[0],
        brand=v[1],
        model=v[2],
        year=v[3],
        status=v[4],
        daily_rate=float(v[5]) if v[5] is not None else None
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
        cursor.execute(
            """
            INSERT INTO Vehicle (vehicle_code, brand, model, year, status, daily_rate)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING vehicle_code, brand, model, year, status, daily_rate
            """,
            (
                vehicle.vehicle_code,
                vehicle.brand,
                vehicle.model,
                vehicle.year,
                vehicle.status,
                vehicle.daily_rate
            )
        )
        db.commit()
        new_vehicle = cursor.fetchone()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()
    
    return VehicleOut(
        vehicle_code=new_vehicle[0],
        brand=new_vehicle[1],
        model=new_vehicle[2],
        year=new_vehicle[3],
        status=new_vehicle[4],
        daily_rate=float(new_vehicle[5])
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
        RETURNING vehicle_code, brand, model, year, status, daily_rate
    """
    
    try:
        cursor.execute(query, values)
        db.commit()
        updated_vehicle = cursor.fetchone()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()
    
    return VehicleOut(
        vehicle_code=updated_vehicle[0],
        brand=updated_vehicle[1],
        model=updated_vehicle[2],
        year=updated_vehicle[3],
        status=updated_vehicle[4],
        daily_rate=float(updated_vehicle[5])
    )
