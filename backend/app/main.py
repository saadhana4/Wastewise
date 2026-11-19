import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api import api_router
from app.database.session import check_db_connection

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("wastewise")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup verification
    logger.info("Initializing WasteWise Backend Service...")
    db_status = check_db_connection()
    logger.info(f"Database Connectivity Check: {db_status['status']}")
    if db_status.get("postgis_enabled"):
        logger.info(f"PostGIS Version: {db_status.get('postgis_version')}")
    yield
    logger.info("Shutting down WasteWise Backend Service...")


app = FastAPI(
    title="WasteWise API",
    description="Geospatial AI for Intelligent Waste Detection, Segregation & Collection",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/", tags=["Root"])
def root():
    return {
        "title": "WasteWise API",
        "description": "Geospatial AI for Intelligent Waste Detection, Segregation & Collection",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "api_v1": "/api/v1",
    }


# Required unversioned health endpoint
@app.get("/api/health", tags=["Health"])
def unversioned_health():
    """
    Standard unversioned health check endpoint.
    """
    return {
        "status": "ok",
        "service": "wastewise-backend",
    }


# Mount API V1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
