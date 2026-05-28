
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
from api.routes import auth, vehicles, customers, rentals, reviews, loyalty, maintenance, analytics
from api.routes.auth import get_current_active_user
from api.core.middleware import ErrorHandlingMiddleware
from api.core.config import settings
from database.connection import connect_db
from jose import jwt, JWTError
import re
import asyncio
import logging

logger = logging.getLogger(__name__)


def _refresh_demo_dates():
    """
    Keep demo data perpetually valid.
    - Active rentals expiring within 3 days → extend return date 14 days from now.
    - Reserved rentals starting in the past → push start date 7 days from now.
    Runs on startup and every 24 h so the demo looks realistic for any visitor.
    """
    try:
        db = connect_db()
        cursor = db.cursor()
        # Extend active rentals that are overdue or nearly due
        cursor.execute("""
            UPDATE Rental
            SET return_datetime = DATE_ADD(NOW(), INTERVAL 14 DAY)
            WHERE status = 'Active'
              AND actual_return_datetime IS NULL
              AND return_datetime < DATE_ADD(NOW(), INTERVAL 3 DAY)
        """)
        # Push reserved rentals whose pickup has already passed
        cursor.execute("""
            UPDATE Rental
            SET pickup_datetime  = DATE_ADD(NOW(), INTERVAL 7  DAY),
                return_datetime  = DATE_ADD(NOW(), INTERVAL 14 DAY)
            WHERE status = 'Reserved'
              AND actual_return_datetime IS NULL
              AND pickup_datetime < NOW()
        """)
        db.commit()
        cursor.close()
        db.close()
    except Exception as e:
        logger.warning(f"Demo refresh skipped: {e}")


async def _demo_refresh_loop():
    while True:
        await asyncio.sleep(24 * 3600)   # every 24 hours
        _refresh_demo_dates()


@asynccontextmanager
async def lifespan(app: FastAPI):
    _refresh_demo_dates()                             # run once on cold start
    task = asyncio.create_task(_demo_refresh_loop())  # then every 24 h
    yield
    task.cancel()


class DemoReadOnlyMiddleware(BaseHTTPMiddleware):
    """Block all write operations for the demo account."""
    WRITE_METHODS = {"POST", "PUT", "DELETE", "PATCH"}
    # Allow login/register regardless
    EXEMPT_PATHS = {"/api/auth/login", "/api/auth/health", "/"}

    async def dispatch(self, request, call_next):
        if request.method in self.WRITE_METHODS and request.url.path not in self.EXEMPT_PATHS:
            token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
            if token:
                try:
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                    if payload.get("sub") == "demo":
                        return JSONResponse(
                            status_code=403,
                            content={"detail": "Demo account is read-only. Contact us for full access."}
                        )
                except JWTError:
                    pass
        return await call_next(request)


app = FastAPI(title="Car Rental API", lifespan=lifespan)

# Root endpoint for health checks and uptime monitors
@app.get("/")
def root():
    return {"status": "ok"}

# Add custom middleware (order matters — outermost runs first)
app.add_middleware(DemoReadOnlyMiddleware)
app.add_middleware(ErrorHandlingMiddleware)

# CORS configuration - allow all Vercel deployments and localhost
# Using regex pattern to match any Vercel preview URL for car-rental-management-system
def verify_origin(origin: str) -> bool:
    """Verify if origin is allowed - matches Vercel deployments and localhost"""
    if not origin:
        return False
    
    # Allow localhost for development
    if origin.startswith("http://localhost"):
        return True
    
    # Allow any car-rental-management-system Vercel deployment
    vercel_pattern = r"^https://car-rental-management-system-[a-z0-9]+\.vercel\.app$"
    if re.match(vercel_pattern, origin):
        return True
    
    return False

# Use allow_origin_regex for dynamic Vercel URLs
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://car-rental-management-system-[a-z0-9]+\.vercel\.app",
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["*"],
    max_age=3600,
)

# Public routes for authentication
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Protected routes requiring authentication
app.include_router(
    vehicles.router,
    prefix="/api/vehicles",
    tags=["vehicles"],
    dependencies=[Depends(get_current_active_user)]
)
app.include_router(
    customers.router,
    prefix="/api/customers",
    tags=["customers"],
    dependencies=[Depends(get_current_active_user)]
)
app.include_router(
    rentals.router,
    prefix="/api/rentals",
    tags=["rentals"],
    dependencies=[Depends(get_current_active_user)]
)
app.include_router(
    loyalty.router,
    prefix="/api/loyalty",
    tags=["loyalty"],
    dependencies=[Depends(get_current_active_user)]
)
app.include_router(
    reviews.router,
    prefix="/api/reviews",
    tags=["reviews"],
    dependencies=[Depends(get_current_active_user)]
)
app.include_router(
    maintenance.router,
    prefix="/api/maintenance",
    tags=["maintenance"],
    dependencies=[Depends(get_current_active_user)]
)
app.include_router(analytics.router)
