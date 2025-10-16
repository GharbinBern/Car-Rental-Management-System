from fastapi import APIRouter, Depends, HTTPException
from database.connection import get_db_connection
from api.routes.auth import get_current_user
import datetime

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/dashboard")
async def get_dashboard_analytics():
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
        
        # Popular vehicles (based on actual rental count)
        cursor.execute("""
            SELECT 
                v.brand,
                v.model,
                COALESCE(v.type, 'Unknown') as vehicle_type,
                COUNT(r.rental_id) as rental_count
            FROM Vehicle v
            LEFT JOIN Rental r ON v.vehicle_id = r.vehicle_id
            GROUP BY v.vehicle_id, v.brand, v.model, v.type
            ORDER BY rental_count DESC
            LIMIT 5
        """)
        popular_vehicles = cursor.fetchall()
        
        # Customer insights - active customers in the last month
        cursor.execute("""
            SELECT COUNT(DISTINCT r.customer_id) as active_customers_month
            FROM Rental r
            WHERE r.pickup_datetime >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
        """)
        customer_insights = cursor.fetchone()
        
        # Maintenance alerts - vehicles due for maintenance
        cursor.execute("""
            SELECT 
                v.brand,
                v.model,
                v.vehicle_code,
                DATEDIFF(CURRENT_DATE, COALESCE(vm.last_maintenance_date, v.vehicle_id * 10)) as days_since_maintenance
            FROM Vehicle v
            LEFT JOIN (
                SELECT vehicle_id, MAX(maintenance_date) as last_maintenance_date
                FROM VehicleMaintenance 
                GROUP BY vehicle_id
            ) vm ON v.vehicle_id = vm.vehicle_id
            WHERE DATEDIFF(CURRENT_DATE, COALESCE(vm.last_maintenance_date, DATE_SUB(CURRENT_DATE, INTERVAL 60 DAY))) > 30
            ORDER BY days_since_maintenance DESC
            LIMIT 5
        """)
        maintenance_alerts = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            "fleet_utilization": fleet_utilization,  
            "popular_vehicles": popular_vehicles,
            "customer_insights": customer_insights,
            "maintenance_alerts": maintenance_alerts,
            "generated_at": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")

@router.get("/revenue")
async def get_revenue_analytics(period: str = "month"):
    """Get revenue analytics"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Determine the date interval based on period
        if period == "day":
            interval = "1 DAY"
            date_format = "DATE(r.pickup_datetime)"
            period_label = "DATE_FORMAT(r.pickup_datetime, '%Y-%m-%d')"
        elif period == "week":
            interval = "7 DAY"
            date_format = "YEARWEEK(r.pickup_datetime)"
            period_label = "CONCAT('Week ', WEEK(r.pickup_datetime), ' ', YEAR(r.pickup_datetime))"
        elif period == "year":
            interval = "365 DAY"
            date_format = "YEAR(r.pickup_datetime)"
            period_label = "YEAR(r.pickup_datetime)"
        else:  # default to month
            interval = "30 DAY"
            date_format = "DATE_FORMAT(r.pickup_datetime, '%Y-%m')"
            period_label = "DATE_FORMAT(r.pickup_datetime, '%M %Y')"
        
        cursor.execute(f"""
            SELECT 
                {period_label} as period,
                COALESCE(SUM(r.total_cost), 0) as revenue,
                COUNT(*) as rental_count
            FROM Rental r
            WHERE r.pickup_datetime >= DATE_SUB(CURRENT_DATE, INTERVAL {interval})
            AND r.total_cost IS NOT NULL
            GROUP BY {date_format}, {period_label}
            ORDER BY {date_format} DESC
            LIMIT 10
        """)
        data = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {"data": data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching revenue: {str(e)}")

@router.get("/fleet-status") 
async def get_fleet_status():
    """Get fleet status overview"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Overall fleet overview
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
        
        # Fleet by branch
        cursor.execute("""
            SELECT 
                COALESCE(b.branch_code, 'Main Branch') as branch_code,
                COALESCE(b.name, 'Main Branch') as branch_name,
                COUNT(v.vehicle_id) as total_vehicles,
                SUM(CASE WHEN v.status = 'Available' THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN v.status = 'Rented' THEN 1 ELSE 0 END) as rented,
                SUM(CASE WHEN v.status = 'Maintenance' THEN 1 ELSE 0 END) as in_maintenance
            FROM Vehicle v
            LEFT JOIN Branch b ON v.branch_id = b.branch_id
            GROUP BY b.branch_id, b.branch_code, b.name
            ORDER BY total_vehicles DESC
        """)
        fleet_by_branch = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            "fleet_overview": fleet_overview,
            "fleet_by_branch": fleet_by_branch,
            "generated_at": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching fleet status: {str(e)}")
