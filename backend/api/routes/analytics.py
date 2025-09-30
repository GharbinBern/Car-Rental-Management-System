from fastapi import APIRouter, Depends, HTTPException
from backend.database.connection import get_db_connection
from backend.api.routes.auth import get_current_user
import datetime

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    """Get comprehensive dashboard analytics"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Fleet utilization by type
        cursor.execute("""
            SELECT 
                COALESCE(v.type, 'Unknown') as vehicle_type,
                COUNT(*) as total_vehicles,
                SUM(CASE WHEN v.status = 'Rented' THEN 1 ELSE 0 END) as rented_count,
                ROUND((SUM(CASE WHEN v.status = 'Rented' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as utilization_rate
            FROM Vehicle v 
            GROUP BY v.type
        """)
        fleet_utilization = cursor.fetchall()
        
        # Popular vehicles
        cursor.execute("""
            SELECT 
                v.brand,
                v.model,
                COALESCE(v.type, 'Unknown') as vehicle_type,
                0 as rental_count
            FROM Vehicle v
            LIMIT 5
        """)
        popular_vehicles = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            "fleet_utilization": fleet_utilization,  
            "popular_vehicles": popular_vehicles,
            "generated_at": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")

@router.get("/revenue")
async def get_revenue_analytics(period: str = "month", current_user: dict = Depends(get_current_user)):
    """Get revenue analytics"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                DATE(r.pickup_datetime) as date,
                SUM(r.total_cost) as revenue,
                COUNT(*) as rentals
            FROM Rental r
            WHERE r.pickup_datetime >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
            GROUP BY DATE(r.pickup_datetime)
            ORDER BY date DESC
        """)
        data = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching revenue: {str(e)}")

@router.get("/fleet-status") 
async def get_fleet_status(current_user: dict = Depends(get_current_user)):
    """Get fleet status overview"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                COUNT(*) as total_vehicles,
                SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN status = 'Rented' THEN 1 ELSE 0 END) as rented,
                SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) as in_maintenance,
                AVG(daily_rate) as avg_daily_rate
            FROM Vehicle
        """)
        fleet_overview = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return {
            "fleet_overview": fleet_overview,
            "generated_at": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching fleet status: {str(e)}")
