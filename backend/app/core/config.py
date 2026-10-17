from pydantic_settings import BaseSettings
import os

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_FILE = BASE_DIR / "transportpro.db"
DEFAULT_DB_URL = f"sqlite:///{DEFAULT_DB_FILE.as_posix()}"

class Settings(BaseSettings):
    PROJECT_NAME: str = "TransportPro ERP"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-jwt-key-transportpro-erp-2026-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", DEFAULT_DB_URL)
    DEMO_MODE: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
