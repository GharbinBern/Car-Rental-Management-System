from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from pydantic import BaseModel, Field, validator
from datetime import date, datetime
from decimal import Decimal

from db_layer.connection import connect_db
from .auth import get_current_active_user

router = APIRouter()

class PromoOfferBase(BaseModel):
    code: str = Field(..., min_length=3, max_length=20, pattern='^[A-Z0-9_-]+$')
    description: str
    discount_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    discount_amount: Optional[Decimal] = Field(None, ge=0)
    min_rental_days: Optional[int] = Field(None, ge=1)
    valid_from: str  # Format: YYYY-MM-DD
    valid_until: str  # Format: YYYY-MM-DD
    is_active: bool = True
    requires_loyalty: bool = False
    min_loyalty_points: Optional[int] = Field(None, ge=0)
    usage_limit: Optional[int] = Field(None, ge=1)

    @validator('code')
    def validate_code(cls, v):
        return v.upper()

    @validator('discount_percentage', 'discount_amount')
    def validate_discount(cls, v, values):
        if 'discount_percentage' in values and values['discount_percentage'] is not None and \
           'discount_amount' in values and values['discount_amount'] is not None:
            raise ValueError('Cannot specify both discount_percentage and discount_amount')
        if v is not None and v == 0:
            raise ValueError('Discount must be greater than 0')
        return v


class PromoOfferCreate(PromoOfferBase):
    pass


class PromoOfferUpdate(BaseModel):
    description: Optional[str] = None
    discount_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    discount_amount: Optional[Decimal] = Field(None, ge=0)
    min_rental_days: Optional[int] = Field(None, ge=1)
    valid_until: Optional[str] = None  # Format: YYYY-MM-DD
    is_active: Optional[bool] = None
    requires_loyalty: Optional[bool] = None
    min_loyalty_points: Optional[int] = Field(None, ge=0)
    usage_limit: Optional[int] = Field(None, ge=1)


class PromoOfferOut(PromoOfferBase):
    promo_id: int
    times_used: int = 0


@router.post("/", response_model=PromoOfferOut)
async def create_promo(promo: PromoOfferCreate, current_user = Depends(get_current_active_user)):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        # Check if promo code already exists
        cursor.execute(
            "SELECT 1 FROM PromoOffer WHERE code = %s",
            (promo.code,)
        )
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Promo code already exists")
            
        # Create promo offer
        cursor.execute(
            """
            INSERT INTO PromoOffer (
                code, description, discount_percentage, discount_amount,
                min_rental_days, valid_from, valid_until, is_active,
                requires_loyalty, min_loyalty_points, usage_limit
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING promo_id
            """,
            (
                promo.code,
                promo.description,
                float(promo.discount_percentage) if promo.discount_percentage else None,
                float(promo.discount_amount) if promo.discount_amount else None,
                promo.min_rental_days,
                promo.valid_from,
                promo.valid_until,
                promo.is_active,
                promo.requires_loyalty,
                promo.min_loyalty_points,
                promo.usage_limit
            )
        )
        promo_id = cursor.fetchone()[0]
        
        db.commit()
        
        return PromoOfferOut(
            promo_id=promo_id,
            times_used=0,
            **promo.dict()
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        db.close()


@router.get("/", response_model=List[PromoOfferOut])
async def list_promos(
    current_user = Depends(get_current_active_user),
    active_only: bool = Query(False),
    valid_now: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        query = """
            SELECT 
                p.*,
                COUNT(rp.rental_id) as times_used
            FROM PromoOffer p
            LEFT JOIN RentalPromo rp ON p.promo_id = rp.promo_id
            WHERE 1=1
        """
        params = []

        if active_only:
            query += " AND p.is_active = TRUE"

        if valid_now:
            query += " AND CURDATE() BETWEEN p.valid_from AND p.valid_until"

        query += """
            GROUP BY p.promo_id
            ORDER BY p.valid_from DESC, p.code
            LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])

        cursor.execute(query, params)
        promos = cursor.fetchall()

        return [
            PromoOfferOut(
                promo_id=p[0],
                code=p[1],
                description=p[2],
                discount_percentage=p[3],
                discount_amount=p[4],
                min_rental_days=p[5],
                valid_from=p[6].strftime('%Y-%m-%d'),
                valid_until=p[7].strftime('%Y-%m-%d'),
                is_active=p[8],
                requires_loyalty=p[9],
                min_loyalty_points=p[10],
                usage_limit=p[11],
                times_used=p[12]
            )
            for p in promos
        ]

    finally:
        cursor.close()
        db.close()


@router.get("/{promo_id}", response_model=PromoOfferOut)
async def get_promo(promo_id: int, current_user = Depends(get_current_active_user)):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        cursor.execute(
            """
            SELECT 
                p.*,
                COUNT(rp.rental_id) as times_used
            FROM PromoOffer p
            LEFT JOIN RentalPromo rp ON p.promo_id = rp.promo_id
            WHERE p.promo_id = %s
            GROUP BY p.promo_id
            """,
            (promo_id,)
        )
        promo = cursor.fetchone()
        
        if not promo:
            raise HTTPException(status_code=404, detail="Promo offer not found")
            
        return PromoOfferOut(
            promo_id=promo[0],
            code=promo[1],
            description=promo[2],
            discount_percentage=promo[3],
            discount_amount=promo[4],
            min_rental_days=promo[5],
            valid_from=promo[6].strftime('%Y-%m-%d'),
            valid_until=promo[7].strftime('%Y-%m-%d'),
            is_active=promo[8],
            requires_loyalty=promo[9],
            min_loyalty_points=promo[10],
            usage_limit=promo[11],
            times_used=promo[12]
        )

    finally:
        cursor.close()
        db.close()


@router.get("/code/{promo_code}", response_model=PromoOfferOut)
async def get_promo_by_code(
    promo_code: str,
    current_user = Depends(get_current_active_user)
):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        cursor.execute(
            """
            SELECT 
                p.*,
                COUNT(rp.rental_id) as times_used
            FROM PromoOffer p
            LEFT JOIN RentalPromo rp ON p.promo_id = rp.promo_id
            WHERE p.code = %s
            GROUP BY p.promo_id
            """,
            (promo_code.upper(),)
        )
        promo = cursor.fetchone()
        
        if not promo:
            raise HTTPException(status_code=404, detail="Promo code not found")
            
        return PromoOfferOut(
            promo_id=promo[0],
            code=promo[1],
            description=promo[2],
            discount_percentage=promo[3],
            discount_amount=promo[4],
            min_rental_days=promo[5],
            valid_from=promo[6].strftime('%Y-%m-%d'),
            valid_until=promo[7].strftime('%Y-%m-%d'),
            is_active=promo[8],
            requires_loyalty=promo[9],
            min_loyalty_points=promo[10],
            usage_limit=promo[11],
            times_used=promo[12]
        )

    finally:
        cursor.close()
        db.close()


@router.put("/{promo_id}", response_model=PromoOfferOut)
async def update_promo(
    promo_id: int,
    promo: PromoOfferUpdate,
    current_user = Depends(get_current_active_user)
):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        # Build update query based on provided fields
        update_parts = []
        params = []
        
        for field, value in promo.dict(exclude_unset=True).items():
            if value is not None:
                update_parts.append(f"{field} = %s")
                # Convert Decimal to float for MySQL
                params.append(float(value) if isinstance(value, Decimal) else value)
                
        if not update_parts:
            raise HTTPException(status_code=400, detail="No updates provided")
            
        params.append(promo_id)
        
        cursor.execute(
            f"""
            UPDATE PromoOffer
            SET {", ".join(update_parts)}
            WHERE promo_id = %s
            """,
            params
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Promo offer not found")
            
        # Fetch updated promo
        cursor.execute(
            """
            SELECT 
                p.*,
                COUNT(rp.rental_id) as times_used
            FROM PromoOffer p
            LEFT JOIN RentalPromo rp ON p.promo_id = rp.promo_id
            WHERE p.promo_id = %s
            GROUP BY p.promo_id
            """,
            (promo_id,)
        )
        updated_promo = cursor.fetchone()
        
        db.commit()
        
        return PromoOfferOut(
            promo_id=updated_promo[0],
            code=updated_promo[1],
            description=updated_promo[2],
            discount_percentage=updated_promo[3],
            discount_amount=updated_promo[4],
            min_rental_days=updated_promo[5],
            valid_from=updated_promo[6].strftime('%Y-%m-%d'),
            valid_until=updated_promo[7].strftime('%Y-%m-%d'),
            is_active=updated_promo[8],
            requires_loyalty=updated_promo[9],
            min_loyalty_points=updated_promo[10],
            usage_limit=updated_promo[11],
            times_used=updated_promo[12]
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        db.close()


@router.delete("/{promo_id}")
async def delete_promo(promo_id: int, current_user = Depends(get_current_active_user)):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        # Check if promo has been used
        cursor.execute(
            "SELECT 1 FROM RentalPromo WHERE promo_id = %s LIMIT 1",
            (promo_id,)
        )
        if cursor.fetchone():
            # If promo has been used, just deactivate it
            cursor.execute(
                "UPDATE PromoOffer SET is_active = FALSE WHERE promo_id = %s",
                (promo_id,)
            )
        else:
            # If promo hasn't been used, we can safely delete it
            cursor.execute(
                "DELETE FROM PromoOffer WHERE promo_id = %s",
                (promo_id,)
            )
            
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Promo offer not found")
            
        db.commit()
        return {
            "message": "Promo offer deactivated" if cursor.rownumber == 0 else "Promo offer deleted"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        db.close()


@router.post("/{promo_id}/validate")
async def validate_promo(
    promo_id: int,
    rental_days: int,
    customer_id: Optional[int] = None,
    current_user = Depends(get_current_active_user)
):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        # Get promo details with usage count
        cursor.execute(
            """
            SELECT 
                p.*,
                COUNT(rp.rental_id) as times_used,
                c.is_loyalty_member,
                COALESCE(l.points_balance, 0) as loyalty_points
            FROM PromoOffer p
            LEFT JOIN RentalPromo rp ON p.promo_id = rp.promo_id
            LEFT JOIN Customer c ON c.customer_id = %s
            LEFT JOIN LoyaltyProgram l ON l.customer_id = c.customer_id
            WHERE p.promo_id = %s
            GROUP BY p.promo_id
            """,
            (customer_id, promo_id)
        )
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Promo offer not found")
            
        promo = {
            'is_active': result[8],
            'valid_from': result[6],
            'valid_until': result[7],
            'requires_loyalty': result[9],
            'min_loyalty_points': result[10],
            'usage_limit': result[11],
            'times_used': result[12],
            'customer_is_loyalty': result[13] if customer_id else None,
            'customer_points': result[14] if customer_id else None
        }
        
        # Validation checks
        errors = []
        
        if not promo['is_active']:
            errors.append("Promo code is not active")
            
        if datetime.now().date() < promo['valid_from'].date():
            errors.append("Promo code is not yet valid")
            
        if datetime.now().date() > promo['valid_until'].date():
            errors.append("Promo code has expired")
            
        if promo['usage_limit'] and promo['times_used'] >= promo['usage_limit']:
            errors.append("Promo code has reached its usage limit")
            
        if customer_id and promo['requires_loyalty'] and not promo['customer_is_loyalty']:
            errors.append("This promo code requires loyalty membership")
            
        if customer_id and promo['min_loyalty_points'] and promo['customer_points'] < promo['min_loyalty_points']:
            errors.append(f"This promo code requires {promo['min_loyalty_points']} loyalty points")
            
        if errors:
            return {
                "is_valid": False,
                "errors": errors
            }
            
        return {
            "is_valid": True,
            "message": "Promo code is valid"
        }

    finally:
        cursor.close()
        db.close()