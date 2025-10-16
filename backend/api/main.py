from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, vehicles, customers, rentals, reviews, loyalty, maintenance, analytics
from api.routes.auth import get_current_active_user
from api.core.middleware import ErrorHandlingMiddleware
from api.core.config import settings

app = FastAPI(title="Car Rental API")

# Add custom middleware
app.add_middleware(ErrorHandlingMiddleware)

# Build allowed origins from settings (comma-separated supported)
origins = []
if settings.FRONTEND_URL:
    # support multiple comma-separated values
    origins = [o.strip() for o in settings.FRONTEND_URL.split(',') if o.strip()]
if not origins:
    # sensible defaults for dev
    origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
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
