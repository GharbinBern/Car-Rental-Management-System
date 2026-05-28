from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: Optional[str] = None
    DB_HOST: str = "localhost"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "car_rental_db"
    DB_PORT: int = 3306

    # JWT settings — SECRET_KEY MUST be set via environment variable
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # CORS settings
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        env_ignore_empty=True,
    )


settings = Settings()

# Fail fast on startup if the JWT secret is missing or weak
_KNOWN_WEAK_KEYS = {"car-rental-project", "secret", "changeme", ""}
if settings.SECRET_KEY in _KNOWN_WEAK_KEYS or len(settings.SECRET_KEY) < 32:
    raise RuntimeError(
        "SECRET_KEY is missing or too weak. "
        "Set a cryptographically random value of at least 32 characters "
        "in your environment or .env file.\n"
        "Generate one with: openssl rand -hex 32"
    )
