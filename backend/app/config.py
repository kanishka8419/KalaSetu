"""
KalaSetu — Application Configuration
Loads settings from environment variables with sensible defaults.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "KalaSetu"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # --- Database ---
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/kalasetu"

    # --- JWT ---
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- AI Services ---
    USE_MOCK_AI: bool = True
    GEMINI_API_KEY: Optional[str] = None

    # --- Cloudinary ---
    USE_MOCK_CLOUDINARY: bool = True
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # --- Maps ---
    USE_MOCK_MAPS: bool = True
    MAPS_API_KEY: Optional[str] = None

    # --- CORS ---
    FRONTEND_URL: str = "http://localhost:3000"

    # --- FAISS ---
    FAISS_INDEX_PATH: str = "data/faiss_index"
    EMBEDDING_DIMENSION: int = 384

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
