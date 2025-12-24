
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, vehicles, customers, rentals, reviews, loyalty, maintenance, analytics
from api.routes.auth import get_current_active_user
from api.core.middleware import ErrorHandlingMiddleware
from api.core.config import settings
import re

app = FastAPI(title="Car Rental API")

# Root endpoint for health checks and uptime monitors
@app.get("/")
def root():
    return {"status": "ok"}

# Add custom middleware
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
    # Temporarily removing auth for testing: dependencies=[Depends(get_current_active_user)]
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
    tags=["rentals"]
    # Temporarily removing auth for testing: dependencies=[Depends(get_current_active_user)]
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
    # Temporarily removing auth for testing: dependencies=[Depends(get_current_active_user)]
)
app.include_router(analytics.router)
