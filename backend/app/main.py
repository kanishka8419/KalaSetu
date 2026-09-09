"""
KalaSetu — FastAPI Application Entry Point
"Where Craft Meets Intelligence"
"""

import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routers import auth, products, search, users, artisans, admin

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and services on startup."""
    await init_db()
    print("KalaSetu backend started - Where Craft Meets Intelligence")
    yield
    print("KalaSetu backend shutting down")


app = FastAPI(
    title="KalaSetu API",
    description="AI-Powered Artisan Marketplace — Where Craft Meets Intelligence",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from fastapi.staticfiles import StaticFiles

# Create uploads folder if missing
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Register routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(search.router)
app.include_router(users.router)
app.include_router(artisans.router)
app.include_router(admin.router)


@app.get("/", tags=["Health"])
async def root():
    """Health check / API info."""
    return {
        "name": "KalaSetu API",
        "version": "1.0.0",
        "status": "operational",
        "tagline": "Where Craft Meets Intelligence",
        "ai_services": {
            "cv_service": "mock" if settings.USE_MOCK_AI else "live",
            "gemini": "mock" if settings.USE_MOCK_AI else "live",
            "embeddings": "active",
            "cloudinary": "mock" if settings.USE_MOCK_CLOUDINARY else "live",
        },
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
