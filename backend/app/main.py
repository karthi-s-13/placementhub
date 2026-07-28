from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import create_tables, SessionLocal
from app.utils.auth import ensure_super_admin
from app.services.scheduler_service import start_scheduler, stop_scheduler
from app.routers import auth, opportunities, comments, saved, announcements, chat, analytics, admin, notifications

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting PlacementHub API...")
    create_tables()
    logger.info("Database tables created/verified.")
    
    # Seed Super Admin
    db = SessionLocal()
    try:
        ensure_super_admin(db)
        logger.info("Super admin account verified.")
    finally:
        db.close()

    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()
    logger.info("PlacementHub API shut down.")


app = FastAPI(
    title="PlacementHub API",
    description="Class Career Portal — Track opportunities, applications, and connect with classmates.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
import os
from fastapi.staticfiles import StaticFiles

os.makedirs("uploads/chat", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(opportunities.router)
app.include_router(comments.router)
app.include_router(saved.router)
app.include_router(announcements.router)
app.include_router(chat.router)
app.include_router(analytics.router)
app.include_router(admin.router)
app.include_router(notifications.router)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
