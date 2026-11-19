from fastapi import APIRouter
from app.database.session import check_db_connection
from app.core.config import settings

router = APIRouter()


@router.get("/health")
def get_health():
    """
    Health check endpoint returning service status and database connectivity (up/down).
    """
    db_check = check_db_connection()
    is_up = db_check.get("database") == "up" or db_check.get("status") == "connected"
    return {
        "status": "ok" if is_up else "degraded",
        "service": "wastewise-backend",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "database": {
            "status": "connected" if is_up else "disconnected",
            "state": "up" if is_up else "down",
            "postgis_enabled": db_check.get("postgis_enabled", False),
            "postgis_version": db_check.get("postgis_version"),
            "error": db_check.get("error"),
        },
        "database_connectivity": "up" if is_up else "down",
    }
