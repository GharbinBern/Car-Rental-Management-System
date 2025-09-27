from pydantic import BaseModel

class Vehicle(BaseModel):
    vehicle_code: str
    brand: str
    model: str
    daily_rate: float
