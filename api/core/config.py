from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
	# Database settings
	DATABASE_URL: Optional[str] = None
	DB_HOST: str = "localhost"
	DB_USER: str = "root"
	DB_PASSWORD: str = "Sevenbern101"
	DB_NAME: str = "car_rental_db"
	DB_PORT: int = 3306

	# JWT settings
	SECRET_KEY: str = "your-secret-key-here"
	ALGORITHM: str = "HS256"
	ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

	# CORS settings
	FRONTEND_URL: str = "http://localhost:5173"

	# Pydantic v2 config
	model_config = SettingsConfigDict(
		env_file=".env",
		extra="ignore",  # ignore any extra env vars not defined as fields
		env_ignore_empty=True,
	)


settings = Settings()
