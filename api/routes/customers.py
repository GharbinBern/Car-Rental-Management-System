from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
import re

from db_layer.connection import connect_db

router = APIRouter()


class CustomerBase(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, pattern='^\\+?1?[\\d\\-\\(\\)\\s]{9,15}$')  # Allow hyphens, spaces, parentheses
    date_of_birth: Optional[str] = None  # Format: YYYY-MM-DD
    license_number: Optional[str] = Field(None, max_length=50)  # Make optional, some customers might not have it
    country_of_residence: Optional[str] = Field(None, max_length=50)
    is_loyalty_member: bool = False


class CustomerCreate(CustomerBase):
    customer_code: Optional[str] = None  # Will be auto-generated if not provided


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, pattern='^\\+?1?\\d{9,15}$')
    license_number: Optional[str] = Field(None, min_length=5, max_length=20)
    address: Optional[str] = Field(None, min_length=5, max_length=200)


class CustomerOut(CustomerBase):
    customer_code: str


@router.get("/", response_model=List[CustomerOut])
def get_customers(search: Optional[str] = None):
    """
    Get all customers, optionally filtered by search term.
    Search applies to name, email, and phone.
    """
    db = connect_db()
    cursor = db.cursor()
    
    query = """
        SELECT customer_code, first_name, last_name, email, phone, license_number, country_of_residence, is_loyalty_member, date_of_birth
        FROM Customer
        WHERE 1=1
    """
    params = []
    
    if search:
        query += """
            AND (
                LOWER(first_name) LIKE %s
                OR LOWER(last_name) LIKE %s
                OR LOWER(email) LIKE %s
                OR phone LIKE %s
                OR license_number LIKE %s
            )
        """
        search_term = f"%{search.lower()}%"
        params.extend([search_term] * 5)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    cursor.close()
    db.close()

    return [
        CustomerOut(
            customer_code=row[0],
            first_name=row[1],
            last_name=row[2],
            email=row[3],
            phone=row[4],
            license_number=row[5],
            country_of_residence=row[6],
            is_loyalty_member=bool(row[7]),
            date_of_birth=row[8].strftime('%Y-%m-%d') if row[8] else None
        )
        for row in rows
    ]


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int):
    db = connect_db()
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT 
            c.customer_id,
            c.customer_code,
            c.first_name,
            c.last_name,
            c.email,
            c.phone,
            c.date_of_birth,
            c.license_number,
            c.country_of_residence,
            c.is_loyalty_member
        FROM Customer c
        WHERE c.customer_id = %s
        """,
        (customer_id,)
    )
    customer = cursor.fetchone()
    cursor.close()
    db.close()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return CustomerOut(
        customer_id=customer[0],
        customer_code=customer[1],
        first_name=customer[2],
        last_name=customer[3],
        email=customer[4],
        phone=customer[5],
        date_of_birth=customer[6].strftime('%Y-%m-%d') if customer[6] else None,
        license_number=customer[7],
        country_of_residence=customer[8],
        is_loyalty_member=customer[9]
    )

    return CustomerOut(
        customer_id=customer[0],
        name=customer[1],
        email=customer[2],
        phone=customer[3],
        license_number=customer[4],
        address=customer[5]
    )


@router.post("/", response_model=CustomerOut, status_code=201)
def create_customer(customer: CustomerCreate):
    db = connect_db()
    cursor = db.cursor()
    
    # Check if email already exists
    cursor.execute("SELECT 1 FROM Customer WHERE email = %s", (customer.email,))
    if cursor.fetchone():
        cursor.close()
        db.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        cursor.execute(
            """
            INSERT INTO Customer (name, email, phone, license_number, address)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING customer_id, name, email, phone, license_number, address
            """,
            (
                customer.name,
                customer.email,
                customer.phone,
                customer.license_number,
                customer.address
            )
        )
        db.commit()
        new_customer = cursor.fetchone()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()
    
    return CustomerOut(
        customer_id=new_customer[0],
        name=new_customer[1],
        email=new_customer[2],
        phone=new_customer[3],
        license_number=new_customer[4],
        address=new_customer[5]
    )


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: int, customer: CustomerUpdate):
    db = connect_db()
    cursor = db.cursor()
    
    # Check if customer exists
    cursor.execute("SELECT 1 FROM Customer WHERE customer_id = %s", (customer_id,))
    if not cursor.fetchone():
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # If email is being updated, check it's not already used by another customer
    if customer.email:
        cursor.execute(
            "SELECT 1 FROM Customer WHERE email = %s AND customer_id != %s",
            (customer.email, customer_id)
        )
        if cursor.fetchone():
            cursor.close()
            db.close()
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Build update query dynamically based on provided fields
    update_fields = []
    values = []
    for field, value in customer.dict(exclude_unset=True).items():
        if value is not None:
            update_fields.append(f"{field} = %s")
            values.append(value)
    
    if not update_fields:
        cursor.close()
        db.close()
        return get_customer(customer_id)
    
    values.append(customer_id)
    query = f"""
        UPDATE Customer
        SET {", ".join(update_fields)}
        WHERE customer_id = %s
        RETURNING customer_id, name, email, phone, license_number, address
    """
    
    try:
        cursor.execute(query, values)
        db.commit()
        updated_customer = cursor.fetchone()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()
    
    return CustomerOut(
        customer_id=updated_customer[0],
        name=updated_customer[1],
        email=updated_customer[2],
        phone=updated_customer[3],
        license_number=updated_customer[4],
        address=updated_customer[5]
    )
