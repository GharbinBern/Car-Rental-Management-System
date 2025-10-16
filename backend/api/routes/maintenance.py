from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from pydantic import BaseModel, Field, validator
from datetime import date, datetime
from decimal import Decimal

from database.connection import connect_db
from api.routes.auth import get_current_active_user

router = APIRouter()

class MaintenanceBase(BaseModel):
    vehicle_id: int
    description: str = Field(..., min_length=5)
    maintenance_date: str  # Format: YYYY-MM-DD
    cost: Optional[Decimal] = Field(None, ge=0)
    performed_by: Optional[str] = Field(None, max_length=100)


class MaintenanceCreate(MaintenanceBase):
    pass


class MaintenanceUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=5)
    maintenance_date: Optional[str] = None  # Format: YYYY-MM-DD
    cost: Optional[Decimal] = Field(None, ge=0)
    performed_by: Optional[str] = Field(None, max_length=100)


class MaintenanceOut(MaintenanceBase):
    maintenance_id: int
    vehicle_info: str  # e.g., "Toyota Camry (ABC-123)"


@router.post("/", response_model=MaintenanceOut)
async def create_maintenance(maintenance: MaintenanceCreate):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        # Verify vehicle exists
        cursor.execute(
            """
            SELECT CONCAT(brand, ' ', model, ' (', plate_number, ')')
            FROM Vehicle
            WHERE vehicle_id = %s
            """,
            (maintenance.vehicle_id,)
        )
        vehicle = cursor.fetchone()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        # Create maintenance record
        cursor.execute(
            """
            INSERT INTO VehicleMaintenance (
                vehicle_id, description, maintenance_date, cost, performed_by
            ) VALUES (%s, %s, %s, %s, %s)
            """,
            (
                maintenance.vehicle_id,
                maintenance.description,
                maintenance.maintenance_date,
                float(maintenance.cost) if maintenance.cost else None,
                maintenance.performed_by
            )
        )
        maintenance_id = cursor.lastrowid
        
        db.commit()
        
        return MaintenanceOut(
            maintenance_id=maintenance_id,
            vehicle_info=vehicle[0],
            **maintenance.dict()
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        db.close()


@router.get("/", response_model=List[MaintenanceOut])
async def list_maintenance(
    vehicle_id: Optional[int] = None,
    start_date: Optional[str] = None,  # Format: YYYY-MM-DD
    end_date: Optional[str] = None,    # Format: YYYY-MM-DD
    min_cost: Optional[float] = Query(None, ge=0),
    max_cost: Optional[float] = Query(None, ge=0),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        query = """
            SELECT 
                m.*,
                CONCAT(v.brand, ' ', v.model, ' (', v.plate_number, ')') as vehicle_info
            FROM VehicleMaintenance m
            JOIN Vehicle v ON m.vehicle_id = v.vehicle_id
            WHERE 1=1
        """
        params = []

        if vehicle_id:
            query += " AND m.vehicle_id = %s"
            params.append(vehicle_id)

        if start_date:
            query += " AND m.maintenance_date >= %s"
            params.append(start_date)

        if end_date:
            query += " AND m.maintenance_date <= %s"
            params.append(end_date)

        if min_cost is not None:
            query += " AND m.cost >= %s"
            params.append(min_cost)

        if max_cost is not None:
            query += " AND m.cost <= %s"
            params.append(max_cost)

        query += """
            ORDER BY m.maintenance_date DESC, m.maintenance_id DESC
            LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])

        cursor.execute(query, params)
        records = cursor.fetchall()

        return [
            MaintenanceOut(
                maintenance_id=r[0],
                vehicle_id=r[1],
                description=r[2],
                maintenance_date=r[3].strftime('%Y-%m-%d'),
                cost=r[4],
                performed_by=r[5],
                vehicle_info=r[6]
            )
            for r in records
        ]

    finally:
        cursor.close()
        db.close()


@router.get("/stats")
async def get_maintenance_stats(
    vehicle_id: Optional[int] = None,
    year: Optional[int] = None
):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        query = """
            SELECT 
                v.vehicle_id,
                CONCAT(v.brand, ' ', v.model, ' (', v.plate_number, ')') as vehicle_info,
                COUNT(m.maintenance_id) as maintenance_count,
                COALESCE(SUM(m.cost), 0) as total_cost,
                MIN(m.maintenance_date) as first_maintenance,
                MAX(m.maintenance_date) as last_maintenance
            FROM Vehicle v
            LEFT JOIN VehicleMaintenance m ON v.vehicle_id = m.vehicle_id
        """
        params = []

        if vehicle_id:
            query += " WHERE v.vehicle_id = %s"
            params.append(vehicle_id)

        if year:
            query += " AND" if vehicle_id else " WHERE"
            query += " YEAR(m.maintenance_date) = %s"
            params.append(year)

        query += """
            GROUP BY v.vehicle_id
            ORDER BY total_cost DESC
        """

        cursor.execute(query, params)
        stats = cursor.fetchall()

        return [
            {
                "vehicle_id": s[0],
                "vehicle_info": s[1],
                "maintenance_count": s[2],
                "total_cost": float(s[3]),
                "first_maintenance": s[4].strftime('%Y-%m-%d') if s[4] else None,
                "last_maintenance": s[5].strftime('%Y-%m-%d') if s[5] else None,
                "average_cost": float(s[3] / s[2]) if s[2] > 0 else 0
            }
            for s in stats
        ]

    finally:
        cursor.close()
        db.close()


@router.get("/{maintenance_id}", response_model=MaintenanceOut)
async def get_maintenance(maintenance_id: int):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        cursor.execute(
            """
            SELECT 
                m.*,
                CONCAT(v.brand, ' ', v.model, ' (', v.plate_number, ')') as vehicle_info
            FROM VehicleMaintenance m
            JOIN Vehicle v ON m.vehicle_id = v.vehicle_id
            WHERE m.maintenance_id = %s
            """,
            (maintenance_id,)
        )
        record = cursor.fetchone()
        
        if not record:
            raise HTTPException(status_code=404, detail="Maintenance record not found")
            
        return MaintenanceOut(
            maintenance_id=record[0],
            vehicle_id=record[1],
            description=record[2],
            maintenance_date=record[3].strftime('%Y-%m-%d'),
            cost=record[4],
            performed_by=record[5],
            vehicle_info=record[6]
        )

    finally:
        cursor.close()
        db.close()


@router.get("/vehicle/{vehicle_id}/history", response_model=List[MaintenanceOut])
async def get_vehicle_maintenance_history(
    vehicle_id: int,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        # First verify vehicle exists
        cursor.execute(
            "SELECT CONCAT(brand, ' ', model, ' (', plate_number, ')') FROM Vehicle WHERE vehicle_id = %s",
            (vehicle_id,)
        )
        vehicle = cursor.fetchone()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        # Get maintenance history
        cursor.execute(
            """
            SELECT 
                m.*
            FROM VehicleMaintenance m
            WHERE m.vehicle_id = %s
            ORDER BY m.maintenance_date DESC, m.maintenance_id DESC
            LIMIT %s OFFSET %s
            """,
            (vehicle_id, limit, offset)
        )
        records = cursor.fetchall()

        return [
            MaintenanceOut(
                maintenance_id=r[0],
                vehicle_id=r[1],
                description=r[2],
                maintenance_date=r[3].strftime('%Y-%m-%d'),
                cost=r[4],
                performed_by=r[5],
                vehicle_info=vehicle[0]
            )
            for r in records
        ]

    finally:
        cursor.close()
        db.close()


@router.put("/{maintenance_id}", response_model=MaintenanceOut)
async def update_maintenance(
    maintenance_id: int,
    maintenance: MaintenanceUpdate
):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        # Build update query based on provided fields
        update_parts = []
        params = []
        
        for field, value in maintenance.dict(exclude_unset=True).items():
            if value is not None:
                update_parts.append(f"{field} = %s")
                # Convert Decimal to float for MySQL
                params.append(float(value) if isinstance(value, Decimal) else value)
                
        if not update_parts:
            raise HTTPException(status_code=400, detail="No updates provided")
            
        params.append(maintenance_id)
        
        cursor.execute(
            f"""
            UPDATE VehicleMaintenance
            SET {", ".join(update_parts)}
            WHERE maintenance_id = %s
            """,
            params
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Maintenance record not found")
            
        # Fetch updated record
        cursor.execute(
            """
            SELECT 
                m.*,
                CONCAT(v.brand, ' ', v.model, ' (', v.plate_number, ')') as vehicle_info
            FROM VehicleMaintenance m
            JOIN Vehicle v ON m.vehicle_id = v.vehicle_id
            WHERE m.maintenance_id = %s
            """,
            (maintenance_id,)
        )
        record = cursor.fetchone()
        
        db.commit()
        
        return MaintenanceOut(
            maintenance_id=record[0],
            vehicle_id=record[1],
            description=record[2],
            maintenance_date=record[3].strftime('%Y-%m-%d'),
            cost=record[4],
            performed_by=record[5],
            vehicle_info=record[6]
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        db.close()


@router.delete("/{maintenance_id}")
async def delete_maintenance(maintenance_id: int):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        cursor.execute(
            "DELETE FROM VehicleMaintenance WHERE maintenance_id = %s",
            (maintenance_id,)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Maintenance record not found")
            
        db.commit()
        return {"message": "Maintenance record deleted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        db.close()