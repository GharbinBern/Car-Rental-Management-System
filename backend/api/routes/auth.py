from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel

from database.connection import connect_db
from api.core.config import settings

# JWT configuration (from settings)
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES or (60 * 24)

import hashlib
# Temporary simple hash for development - NOT for production
def simple_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None


class UserInDB(User):
    hashed_password: str


def verify_password(plain_password, hashed_password):
    try:
        return simple_hash(plain_password) == hashed_password
    except Exception as e:
        return False


def get_password_hash(password):
    try:
        return simple_hash(password)
    except Exception as e:
        return None


def get_user(username: str):
    try:
        db = connect_db()
        cursor = db.cursor()
        cursor.execute(
            "SELECT username, email, full_name, disabled, password FROM users WHERE username = %s",
            (username,)
        )
        user = cursor.fetchone()
        
        if user:
            return UserInDB(
                username=user[0],
                email=user[1],
                full_name=user[2],
                disabled=user[3],
                hashed_password=user[4]
            )
        return None
    except Exception as e:
        return None
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'db' in locals():
            db.close()


def authenticate_user(username: str, password: str):
    try:
        user = get_user(username)
        if not user:
            return False
        
        # Truncate password if too long for bcrypt
        if len(password.encode('utf-8')) > 72:
            password = password[:72]
            
        if not verify_password(password, user.hashed_password):
            return False
        return user
    except Exception as e:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        # Quick validation
        if not form_data.username or not form_data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username and password are required"
            )
        
        user = authenticate_user(form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )


@router.get("/test")
async def test_auth():
    """Quick test endpoint to check API responsiveness"""
    return {"message": "API is responding", "timestamp": datetime.utcnow().isoformat()}


# Health check endpoint supporting both GET and HEAD
@router.get("/health", include_in_schema=False)
@router.head("/health", include_in_schema=False)
async def health_check():
    return {"status": "ok"}

@router.post("/register", response_model=User)
async def register_user(username: str, password: str, email: str, full_name: str):
    db = connect_db()
    cursor = db.cursor()
    
    # Check if username already exists
    cursor.execute("SELECT 1 FROM users WHERE username = %s", (username,))
    if cursor.fetchone():
        cursor.close()
        db.close()
        raise HTTPException(status_code=400, detail="Username already registered")
    
    try:
        hashed_password = get_password_hash(password)
        cursor.execute(
            """
            INSERT INTO users (username, password, email, full_name, disabled)
            VALUES (%s, %s, %s, %s, false)
            """,
            (username, hashed_password, email, full_name)
        )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        db.close()
    
    return User(
        username=username,
        email=email,
        full_name=full_name,
        disabled=False
    )