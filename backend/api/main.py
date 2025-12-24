
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, vehicles, customers, rentals, reviews, loyalty, maintenance, analytics
from api.routes.auth import get_current_active_user
from api.core.middleware import ErrorHandlingMiddleware
from api.core.config import settings

app = FastAPI(title="Car Rental API")

# Root endpoint for health checks and uptime monitors
@app.get("/")
def root():
    return {"status": "ok"}

# Add custom middleware
app.add_middleware(ErrorHandlingMiddleware)

# CORS configuration - allow multiple Vercel deployments and localhost
origins = [
    "https://car-rental-management-system-cqykbpc93.vercel.app",  # Current Vercel frontend
    "https://car-rental-management-system-41xhvys29.vercel.app",  # Previous Vercel frontend
    "http://localhost:3000",
    "http://localhost:5173"
]

# For production, you can also use wildcard for all Vercel preview deployments:
# origins = ["https://*.vercel.app", "http://localhost:3000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
