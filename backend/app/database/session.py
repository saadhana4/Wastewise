import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger(__name__)

# Base declarative class for all models
Base = declarative_base()

# Engine configuration with fast connection timeout
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
    connect_args={"connect_timeout": 2},
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a managed database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> dict:
    """
    Inspects database connectivity and checks PostGIS extension availability.
    Returns status dictionary safely without crashing.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            
            # Check PostGIS extension
            postgis_version = None
            try:
                res = conn.execute(text("SELECT PostGIS_Version()")).scalar()
                postgis_version = str(res)
            except Exception:
                postgis_version = None

            return {
                "status": "connected",
                "database": "up",
                "postgis_enabled": postgis_version is not None,
                "postgis_version": postgis_version,
            }
    except Exception as exc:
        logger.warning(f"Database connection check failed: {exc}")
        return {
            "status": "disconnected",
            "database": "down",
            "error": str(exc),
            "postgis_enabled": False,
            "postgis_version": None,
        }
