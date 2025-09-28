from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routes import vehicles, customers, rentals, auth, loyalty, reviews, promos, maintenance
from .routes.auth import get_current_active_user

app = FastAPI(title="Car Rental API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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
    promos.router,
    prefix="/api/promos",
    tags=["promos"],
    dependencies=[Depends(get_current_active_user)]
)
app.include_router(
    maintenance.router,
    prefix="/api/maintenance",
    tags=["maintenance"],
    dependencies=[Depends(get_current_active_user)]
)
