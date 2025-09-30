from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from pydantic import BaseModel, Field, validator
from datetime import date
from decimal import Decimal

from backend.database.connection import connect_db
from backend.api.routes.auth import get_current_active_user

router = APIRouter()

class ReviewBase(BaseModel):
    rental_id: int
    rating_score: Decimal = Field(..., ge=1.0, le=5.0)
    review_text: Optional[str] = None
    review_date: str  # Format: YYYY-MM-DD

    @validator('rating_score')
    def validate_rating(cls, v):
        # Ensure rating has at most 1 decimal place
        if abs(v * 10 - round(v * 10)) > 1e-10:
            raise ValueError('Rating score must have at most 1 decimal place')
        return v


class ReviewCreate(ReviewBase):
    pass


class ReviewOut(ReviewBase):
    review_id: int
    # Include rental details for context
    vehicle_info: str
    customer_name: str


@router.post("/", response_model=ReviewOut)
async def create_review(review: ReviewCreate, current_user = Depends(get_current_active_user)):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        # Verify rental exists and hasn't been reviewed
        cursor.execute(
            """
            SELECT r.rental_id, 
                   CONCAT(v.brand, ' ', v.model, ' (', v.plate_number, ')') as vehicle_info,
                   CONCAT(c.first_name, ' ', c.last_name) as customer_name
            FROM Rental r
            JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
            JOIN Customer c ON r.customer_id = c.customer_id
            LEFT JOIN ReviewRatings rr ON r.rental_id = rr.rental_id
            WHERE r.rental_id = %s
            """,
            (review.rental_id,)
        )
        rental = cursor.fetchone()
        
        if not rental:
            raise HTTPException(status_code=404, detail="Rental not found")
            
        # Create review
        cursor.execute(
            """
            INSERT INTO ReviewRatings (
                rental_id, rating_score, review_text, review_date
            ) VALUES (%s, %s, %s, %s)
            RETURNING review_id
            """,
            (
                review.rental_id,
                float(review.rating_score),  # Convert Decimal to float for MySQL
                review.review_text,
                review.review_date
            )
        )
        review_id = cursor.fetchone()[0]
        
        db.commit()
        
        return ReviewOut(
            review_id=review_id,
            rental_id=review.rental_id,
            rating_score=review.rating_score,
            review_text=review.review_text,
            review_date=review.review_date,
            vehicle_info=rental[1],
            customer_name=rental[2]
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        db.close()


@router.get("/rental/{rental_id}", response_model=ReviewOut)
async def get_rental_review(rental_id: int, current_user = Depends(get_current_active_user)):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        cursor.execute(
            """
            SELECT 
                rr.review_id,
                rr.rental_id,
                rr.rating_score,
                rr.review_text,
                rr.review_date,
                CONCAT(v.brand, ' ', v.model, ' (', v.plate_number, ')') as vehicle_info,
                CONCAT(c.first_name, ' ', c.last_name) as customer_name
            FROM ReviewRatings rr
            JOIN Rental r ON rr.rental_id = r.rental_id
            JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
            JOIN Customer c ON r.customer_id = c.customer_id
            WHERE rr.rental_id = %s
            """,
            (rental_id,)
        )
        review = cursor.fetchone()
        
        if not review:
            raise HTTPException(status_code=404, detail="Review not found for this rental")
            
        return ReviewOut(
            review_id=review[0],
            rental_id=review[1],
            rating_score=review[2],
            review_text=review[3],
            review_date=review[4].strftime('%Y-%m-%d'),
            vehicle_info=review[5],
            customer_name=review[6]
        )

    finally:
        cursor.close()
        db.close()


@router.get("/vehicle/{vehicle_id}", response_model=List[ReviewOut])
async def get_vehicle_reviews(
    vehicle_id: int,
    current_user = Depends(get_current_active_user),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        cursor.execute(
            """
            SELECT 
                rr.review_id,
                rr.rental_id,
                rr.rating_score,
                rr.review_text,
                rr.review_date,
                CONCAT(v.brand, ' ', v.model, ' (', v.plate_number, ')') as vehicle_info,
                CONCAT(c.first_name, ' ', c.last_name) as customer_name
            FROM ReviewRatings rr
            JOIN Rental r ON rr.rental_id = r.rental_id
            JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
            JOIN Customer c ON r.customer_id = c.customer_id
            WHERE v.vehicle_id = %s
            ORDER BY rr.review_date DESC
            LIMIT %s OFFSET %s
            """,
            (vehicle_id, limit, offset)
        )
        reviews = cursor.fetchall()
        
        return [
            ReviewOut(
                review_id=review[0],
                rental_id=review[1],
                rating_score=review[2],
                review_text=review[3],
                review_date=review[4].strftime('%Y-%m-%d'),
                vehicle_info=review[5],
                customer_name=review[6]
            )
            for review in reviews
        ]

    finally:
        cursor.close()
        db.close()


@router.get("/customer/{customer_id}", response_model=List[ReviewOut])
async def get_customer_reviews(
    customer_id: int,
    current_user = Depends(get_current_active_user),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        cursor.execute(
            """
            SELECT 
                rr.review_id,
                rr.rental_id,
                rr.rating_score,
                rr.review_text,
                rr.review_date,
                CONCAT(v.brand, ' ', v.model, ' (', v.plate_number, ')') as vehicle_info,
                CONCAT(c.first_name, ' ', c.last_name) as customer_name
            FROM ReviewRatings rr
            JOIN Rental r ON rr.rental_id = r.rental_id
            JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
            JOIN Customer c ON r.customer_id = c.customer_id
            WHERE r.customer_id = %s
            ORDER BY rr.review_date DESC
            LIMIT %s OFFSET %s
            """,
            (customer_id, limit, offset)
        )
        reviews = cursor.fetchall()
        
        return [
            ReviewOut(
                review_id=review[0],
                rental_id=review[1],
                rating_score=review[2],
                review_text=review[3],
                review_date=review[4].strftime('%Y-%m-%d'),
                vehicle_info=review[5],
                customer_name=review[6]
            )
            for review in reviews
        ]

    finally:
        cursor.close()
        db.close()


@router.put("/{review_id}", response_model=ReviewOut)
async def update_review(
    review_id: int,
    rating_score: Optional[Decimal] = Query(None, ge=1.0, le=5.0),
    review_text: Optional[str] = None,
    current_user = Depends(get_current_active_user)
):
    if rating_score is None and review_text is None:
        raise HTTPException(status_code=400, detail="No updates provided")

    db = connect_db()
    cursor = db.cursor()
    
    try:
        # Build update query based on provided fields
        update_parts = []
        params = []
        
        if rating_score is not None:
            update_parts.append("rating_score = %s")
            params.append(float(rating_score))
            
        if review_text is not None:
            update_parts.append("review_text = %s")
            params.append(review_text)
            
        params.append(review_id)
        
        cursor.execute(
            f"""
            UPDATE ReviewRatings
            SET {", ".join(update_parts)}
            WHERE review_id = %s
            """,
            params
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Review not found")
            
        # Fetch updated review
        cursor.execute(
            """
            SELECT 
                rr.review_id,
                rr.rental_id,
                rr.rating_score,
                rr.review_text,
                rr.review_date,
                CONCAT(v.brand, ' ', v.model, ' (', v.plate_number, ')') as vehicle_info,
                CONCAT(c.first_name, ' ', c.last_name) as customer_name
            FROM ReviewRatings rr
            JOIN Rental r ON rr.rental_id = r.rental_id
            JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
            JOIN Customer c ON r.customer_id = c.customer_id
            WHERE rr.review_id = %s
            """,
            (review_id,)
        )
        review = cursor.fetchone()
        
        db.commit()
        
        return ReviewOut(
            review_id=review[0],
            rental_id=review[1],
            rating_score=review[2],
            review_text=review[3],
            review_date=review[4].strftime('%Y-%m-%d'),
            vehicle_info=review[5],
            customer_name=review[6]
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        db.close()


@router.delete("/{review_id}")
async def delete_review(review_id: int, current_user = Depends(get_current_active_user)):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        cursor.execute(
            "DELETE FROM ReviewRatings WHERE review_id = %s",
            (review_id,)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Review not found")
            
        db.commit()
        return {"message": "Review deleted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        db.close()