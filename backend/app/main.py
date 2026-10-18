from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import Base, engine
from app.services.seed import seed
from app.api import (
    auth, staff, vehicles, drivers, customers, trips, expenses,
    invoices, dashboard, reports, subscriptions, audit, saas_admin
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables created and initial demo seed exists
    Base.metadata.create_all(bind=engine)
    seed()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(staff.router, prefix=settings.API_V1_STR)
app.include_router(vehicles.router, prefix=settings.API_V1_STR)
app.include_router(drivers.router, prefix=settings.API_V1_STR)
app.include_router(customers.router, prefix=settings.API_V1_STR)
app.include_router(trips.router, prefix=settings.API_V1_STR)
app.include_router(expenses.router, prefix=settings.API_V1_STR)
app.include_router(invoices.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(subscriptions.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(saas_admin.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
def health(db = Depends(get_db)):
    from app.models.entities import User, Organization
    from datetime import datetime, timezone
    db_type = "postgresql" if "postgres" in settings.DATABASE_URL else "sqlite"
    user_count = db.query(User).count()
    org_count = db.query(Organization).count()
    return {
        "status": "operational",
        "database": db_type,
        "total_users": user_count,
        "total_organizations": org_count,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
