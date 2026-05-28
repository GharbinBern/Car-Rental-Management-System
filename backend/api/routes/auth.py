import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from api.core.config import settings
from database.connection import connect_db

logger = logging.getLogger(__name__)

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES or (60 * 24)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()


# ── Models ────────────────────────────────────────────────────────────────────

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


# ── Password helpers ──────────────────────────────────────────────────────────

def _is_legacy_sha256(h: str) -> bool:
    """Detect old unsalted SHA-256 hashes so we can migrate them."""
    return len(h) == 64 and all(c in '0123456789abcdef' for c in h)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if _is_legacy_sha256(hashed_password):
        # Accept legacy hash; caller will upgrade it to bcrypt
        return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def _upgrade_to_bcrypt(username: str, plain_password: str) -> None:
    """Silently re-hash a legacy SHA-256 password to bcrypt on first successful login."""
    try:
        new_hash = get_password_hash(plain_password)
        db = connect_db()
        cursor = db.cursor()
        cursor.execute("UPDATE users SET password = %s WHERE username = %s", (new_hash, username))
        db.commit()
        cursor.close()
        db.close()
        logger.info("Migrated password hash for user '%s' from SHA-256 to bcrypt", username)
    except Exception as e:
        logger.warning("Could not upgrade password hash for '%s': %s", username, e)


# ── DB helpers ────────────────────────────────────────────────────────────────

def get_user(username: str) -> Optional[UserInDB]:
    try:
        db = connect_db()
        cursor = db.cursor()
        cursor.execute(
            "SELECT username, email, full_name, disabled, password FROM users WHERE username = %s",
            (username,)
        )
        row = cursor.fetchone()
        if row:
            return UserInDB(username=row[0], email=row[1], full_name=row[2],
                            disabled=row[3], hashed_password=row[4])
        return None
    except Exception as e:
        logger.error("get_user error: %s", e)
        return None
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'db' in locals(): db.close()


def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    user = get_user(username)
    if not user:
        return None
    # bcrypt max is 72 bytes
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    if not verify_password(password, user.hashed_password):
        return None
    # Transparently upgrade legacy SHA-256 hashes to bcrypt
    if _is_legacy_sha256(user.hashed_password):
        _upgrade_to_bcrypt(username, password)
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ── Auth dependencies ─────────────────────────────────────────────────────────

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
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


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if not form_data.username or not form_data.password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": token, "token_type": "bearer"}


@router.post("/register", response_model=User)
async def register_user(
    username: str, password: str, email: str, full_name: str,
    _: User = Depends(get_current_active_user)   # admin must be logged in
):
    """Create a new user account. Requires an existing authenticated session."""
    db = connect_db()
    cursor = db.cursor()
    cursor.execute("SELECT 1 FROM users WHERE username = %s", (username,))
    if cursor.fetchone():
        cursor.close()
        db.close()
        raise HTTPException(status_code=400, detail="Username already registered")
    try:
        cursor.execute(
            "INSERT INTO users (username, password, email, full_name, disabled) VALUES (%s, %s, %s, %s, false)",
            (username, get_password_hash(password), email, full_name)
        )
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error("register_user error: %s", e)
        raise HTTPException(status_code=500, detail="Could not create user")
    finally:
        cursor.close()
        db.close()
    return User(username=username, email=email, full_name=full_name, disabled=False)


@router.get("/health", include_in_schema=False)
@router.head("/health", include_in_schema=False)
async def health_check():
    return {"status": "ok"}
