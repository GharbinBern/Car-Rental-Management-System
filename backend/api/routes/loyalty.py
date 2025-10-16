from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date
from decimal import Decimal

from database.connection import connect_db
from api.routes.auth import get_current_active_user

router = APIRouter()

class LoyaltyProgramBase(BaseModel):
    customer_id: int
    points_balance: int = 0
    membership_tier: str = Field('Bronze', pattern='^(Bronze|Silver|Gold|Platinum)$')
    date_joined: str  # Format: YYYY-MM-DD


class LoyaltyProgramCreate(LoyaltyProgramBase):
    pass


class LoyaltyProgramOut(LoyaltyProgramBase):
    program_id: int


@router.post("/", response_model=LoyaltyProgramOut)
async def create_loyalty_program(program: LoyaltyProgramCreate, current_user = Depends(get_current_active_user)):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        # Check if customer exists and is not already a loyalty member
        cursor.execute(
            "SELECT is_loyalty_member FROM Customer WHERE customer_id = %s",
            (program.customer_id,)
        )
        customer = cursor.fetchone()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        if customer[0]:
            raise HTTPException(status_code=400, detail="Customer is already a loyalty member")

        # Create loyalty program entry
        cursor.execute(
            """
            INSERT INTO LoyaltyProgram (
                customer_id, points_balance, membership_tier, date_joined
            ) VALUES (%s, %s, %s, %s)
            """,
            (
                program.customer_id,
                program.points_balance,
                program.membership_tier,
                program.date_joined
            )
        )
        program_id = cursor.lastrowid

        # Update customer's loyalty status
        cursor.execute(
            "UPDATE Customer SET is_loyalty_member = TRUE WHERE customer_id = %s",
            (program.customer_id,)
        )
        
        db.commit()
        
        return LoyaltyProgramOut(
            program_id=program_id,
            customer_id=program.customer_id,
            points_balance=program.points_balance,
            membership_tier=program.membership_tier,
            date_joined=program.date_joined
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        db.close()


@router.get("/{customer_id}", response_model=LoyaltyProgramOut)
async def get_loyalty_program(customer_id: int, current_user = Depends(get_current_active_user)):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        cursor.execute(
            """
            SELECT 
                program_id, customer_id, points_balance,
                membership_tier, date_joined
            FROM LoyaltyProgram
            WHERE customer_id = %s
            """,
            (customer_id,)
        )
        program = cursor.fetchone()
        
        if not program:
            raise HTTPException(status_code=404, detail="Loyalty program not found for this customer")
            
        return LoyaltyProgramOut(
            program_id=program[0],
            customer_id=program[1],
            points_balance=program[2],
            membership_tier=program[3],
            date_joined=program[4].strftime('%Y-%m-%d')
        )

    finally:
        cursor.close()
        db.close()


@router.put("/{customer_id}/points", response_model=LoyaltyProgramOut)
async def update_points_balance(
    customer_id: int,
    points_change: int = Query(..., description="Points to add (positive) or subtract (negative)"),
    current_user = Depends(get_current_active_user)
):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        # Get current points and verify program exists
        cursor.execute(
            """
            SELECT program_id, points_balance, membership_tier, date_joined
            FROM LoyaltyProgram
            WHERE customer_id = %s
            FOR UPDATE
            """,
            (customer_id,)
        )
        program = cursor.fetchone()
        
        if not program:
            raise HTTPException(status_code=404, detail="Loyalty program not found for this customer")
            
        new_balance = max(0, program[1] + points_change)  # Points can't go below 0
        
        # Update points balance and determine new tier
        new_tier = program[2]  # Default to current tier
        if new_balance >= 10000:
            new_tier = 'Platinum'
        elif new_balance >= 5000:
            new_tier = 'Gold'
        elif new_balance >= 1000:
            new_tier = 'Silver'
            
        cursor.execute(
            """
            UPDATE LoyaltyProgram
            SET points_balance = %s,
                membership_tier = %s
            WHERE customer_id = %s
            """,
            (new_balance, new_tier, customer_id)
        )
        
        db.commit()
        
        return LoyaltyProgramOut(
            program_id=program[0],
            customer_id=customer_id,
            points_balance=new_balance,
            membership_tier=new_tier,
            date_joined=program[3].strftime('%Y-%m-%d')
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        db.close()


@router.delete("/{customer_id}")
async def delete_loyalty_program(customer_id: int, current_user = Depends(get_current_active_user)):
    db = connect_db()
    cursor = db.cursor()
    
    try:
        # Verify program exists
        cursor.execute(
            "SELECT 1 FROM LoyaltyProgram WHERE customer_id = %s",
            (customer_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Loyalty program not found for this customer")
            
        # Delete program (customer.is_loyalty_member will be updated by trigger)
        cursor.execute(
            "DELETE FROM LoyaltyProgram WHERE customer_id = %s",
            (customer_id,)
        )
        
        db.commit()
        return {"message": "Loyalty program deleted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        db.close()