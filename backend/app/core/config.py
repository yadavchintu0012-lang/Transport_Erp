from pydantic_settings import BaseSettings
import os

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = Path("/data") if Path("/data").exists() else BASE_DIR
NEON_CLOUD_DB_URL = "postgresql://neondb_owner:npg_Udl85IMaHxsg@ep-super-shadow-b5d9si5i.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"

class Settings(BaseSettings):
    PROJECT_NAME: str = "TransportPro ERP"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-jwt-key-transportpro-erp-2026-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 90 # 90 days persistent login
    DATABASE_URL: str = os.getenv("DATABASE_URL", NEON_CLOUD_DB_URL)
    DEMO_MODE: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
