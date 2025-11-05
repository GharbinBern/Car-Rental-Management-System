
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

# Restrict CORS to Vercel frontend and localhost for dev
origins = [
    "https://car-rental-management-system-41xhvys29.vercel.app",  # your Vercel frontend
    "http://localhost:3000",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
